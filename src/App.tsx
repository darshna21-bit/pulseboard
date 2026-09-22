import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Job, WorkMode } from './types/job'
import { fetchInitialJobs } from './mocks/mockApi'
import { JobFeed } from './components/JobFeed'
import { SearchBar } from './components/SearchBar'
import { FilterPanel } from './components/FilterPanel'
import { ConnectionStatus } from './components/ConnectionStatus'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Input } from './components/ui/Input'
import { useDebounce } from './hooks/useDebounce'
import { useJobSocket } from './hooks/useJobSocket'
import { useSavedJobs } from './hooks/useSavedJobs'
import { computeMatchScore, isSkillMatch } from './utils/matchScore'

export default function App() {
  // Owns optimistic bookmark state with automated error rollback and localStorage persistence
  const { savedIds, savedJobs, pendingIds, toggleSave } = useSavedJobs()
  const savedJobsRef = useRef(savedJobs)
  useEffect(() => {
    savedJobsRef.current = savedJobs
  }, [savedJobs])

  // Realistic initial loading & error state for simulated REST API
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [jobs, setJobs] = useState<Job[]>(() => savedJobs)
  const [newJobIds, setNewJobIds] = useState<Set<string>>(new Set())

  // Asynchronous REST API snapshot retrieval with automated retry capability
  const loadInitialJobs = useCallback(async () => {
    setIsInitialLoading(true)
    setFetchError(null)
    try {
      const initial = await fetchInitialJobs(24)
      setJobs((prev) => {
        const existingIds = new Set(prev.map((j) => j.id))
        const deduplicated = initial.filter((j) => !existingIds.has(j.id))
        const merged = [...prev, ...deduplicated]
        const mergedIds = new Set(merged.map((j) => j.id))
        const missingSaved = savedJobsRef.current.filter((sj) => !mergedIds.has(sj.id))
        return [...missingSaved, ...merged].slice(0, 400)
      })
    } catch (err) {
      console.error('[App] Failed to load initial jobs:', err)
      setFetchError(
        err instanceof Error
          ? err.message
          : "Couldn't load jobs — check your connection",
      )
    } finally {
      setIsInitialLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInitialJobs()
  }, [loadInitialJobs])

  // Timers to clear the temporary "isNew" highlight after ~4 seconds
  const newJobTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    const timers = newJobTimersRef.current
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
    }
  }, [])

  // Live-stream pause & buffering flow control
  const [isStreamPaused, setIsStreamPaused] = useState(false)
  const isStreamPausedRef = useRef(isStreamPaused)
  useEffect(() => {
    isStreamPausedRef.current = isStreamPaused
  }, [isStreamPaused])

  const [bufferedJobs, setBufferedJobs] = useState<Job[]>([])
  const bufferedJobsRef = useRef(bufferedJobs)
  useEffect(() => {
    bufferedJobsRef.current = bufferedJobs
  }, [bufferedJobs])

  // Helper to schedule temporary "isNew" highlight for a job
  const triggerNewHighlight = useCallback((jobId: string) => {
    setNewJobIds((prev) => {
      const next = new Set(prev)
      next.add(jobId)
      return next
    })

    const timer = setTimeout(() => {
      setNewJobIds((prev) => {
        const next = new Set(prev)
        next.delete(jobId)
        return next
      })
      newJobTimersRef.current.delete(jobId)
    }, 4000)

    newJobTimersRef.current.set(jobId, timer)
  }, [])

  // Callback for live incoming WebSocket jobs
  const handleNewJob = useCallback((incomingJob: Job) => {
    // When stream is paused, buffer incoming jobs rather than prepending to visible feed
    if (isStreamPausedRef.current) {
      setBufferedJobs((prev) => {
        if (prev.some((j) => j.id === incomingJob.id)) return prev
        return [incomingJob, ...prev]
      })
      return
    }

    setJobs((prev) => {
      // Prevent duplicate job IDs in telemetry
      if (prev.some((j) => j.id === incomingJob.id)) return prev
      return [incomingJob, ...prev].slice(0, 400)
    })

    triggerNewHighlight(incomingJob.id)
  }, [triggerNewHighlight])

  // Flushes all buffered jobs to the top of the feed and restores live streaming
  const handleFlushBufferedJobs = useCallback(() => {
    const buffered = bufferedJobsRef.current
    if (buffered.length > 0) {
      setJobs((prev) => {
        const existingIds = new Set(prev.map((j) => j.id))
        const deduplicated = buffered.filter((j) => !existingIds.has(j.id))
        return [...deduplicated, ...prev].slice(0, 400)
      })

      buffered.forEach((job) => {
        triggerNewHighlight(job.id)
      })

      setBufferedJobs([])
    }

    setIsStreamPaused(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [triggerNewHighlight])

  // Toggle pause / resume live stream
  const handleTogglePause = useCallback(() => {
    if (isStreamPaused) {
      // Resuming stream flushes any buffered jobs and restores live updates
      handleFlushBufferedJobs()
    } else {
      setIsStreamPaused(true)
    }
  }, [isStreamPaused, handleFlushBufferedJobs])

  // Owns real-time connection lifecycle & auto-reconnect backoff
  const { connection } = useJobSocket(handleNewJob)

  // Candidate Target Profile state for dynamic match scoring
  const [profileInput, setProfileInput] = useState('')
  const [profileSkills, setProfileSkills] = useState<string[]>([])

  const handleProfileChange = (value: string) => {
    setProfileInput(value)
    const raw = value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    // Deduplicate case-insensitively while preserving original casing
    const seen = new Set<string>()
    const deduped: string[] = []
    for (const item of raw) {
      const lower = item.toLowerCase()
      if (!seen.has(lower)) {
        seen.add(lower)
        deduped.push(item)
      }
    }
    setProfileSkills(deduped)
  }

  const handleClearProfile = () => {
    setProfileInput('')
    setProfileSkills([])
  }

  // Derive which candidate profile skills actually match currently loaded jobs
  const { matchedProfileSkills, unmatchedProfileSkills } = useMemo(() => {
    if (profileSkills.length === 0 || jobs.length === 0) {
      return { matchedProfileSkills: [], unmatchedProfileSkills: [] }
    }

    const allJobTags = new Set<string>()
    for (const job of jobs) {
      for (const tag of job.tags) {
        allJobTags.add(tag)
      }
    }

    const matched: string[] = []
    const unmatched: string[] = []

    for (const skill of profileSkills) {
      const hasMatch = Array.from(allJobTags).some((tag) => isSkillMatch(skill, tag))
      if (hasMatch) {
        matched.push(skill)
      } else {
        unmatched.push(skill)
      }
    }

    return { matchedProfileSkills: matched, unmatchedProfileSkills: unmatched }
  }, [profileSkills, jobs])

  // Search & Filter state
  const DEFAULT_MIN_MATCH = 50
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)
  const [activeModes, setActiveModes] = useState<Set<WorkMode>>(new Set())
  const [minMatch, setMinMatch] = useState<number>(DEFAULT_MIN_MATCH)
  const [showSavedOnly, setShowSavedOnly] = useState(false)

  const handleToggleMode = (mode: WorkMode) => {
    setActiveModes((prev) => {
      const next = new Set(prev)
      if (next.has(mode)) {
        next.delete(mode)
      } else {
        next.add(mode)
      }
      return next
    })
  }

  const handleToggleSavedOnly = () => {
    setShowSavedOnly((prev) => !prev)
  }

  const handleResetFilters = () => {
    setSearchInput('')
    setActiveModes(new Set())
    setMinMatch(DEFAULT_MIN_MATCH)
    setShowSavedOnly(false)
  }

  // Recompute match score dynamically when user profile skills are defined
  const scoredJobs = useMemo(() => {
    if (profileSkills.length === 0) {
      return jobs
    }
    return jobs.map((job) => ({
      ...job,
      matchScore: computeMatchScore(profileSkills, job.tags, job.matchScore),
    }))
  }, [jobs, profileSkills])

  // Derive filtered jobs with useMemo over scoredJobs
  const filteredJobs = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase()

    return scoredJobs.filter((job) => {
      // 0. Saved jobs filter
      if (showSavedOnly && !savedIds.has(job.id)) return false

      // 1. Min match score filter (only applied once candidate profile skills are defined)
      if (profileSkills.length > 0 && job.matchScore < minMatch) return false

      // 2. Work mode filter (if any selected, otherwise show all)
      if (activeModes.size > 0 && !activeModes.has(job.workMode)) return false

      // 3. Search query: case-insensitive substring match against title, company, or tags
      if (query) {
        const matchesTitle = job.title.toLowerCase().includes(query)
        const matchesCompany = job.company.toLowerCase().includes(query)
        const matchesTag = job.tags.some((tag) => tag.toLowerCase().includes(query))
        if (!matchesTitle && !matchesCompany && !matchesTag) return false
      }

      return true
    })
  }, [scoredJobs, debouncedSearch, activeModes, minMatch, showSavedOnly, savedIds, profileSkills])

  const hasActiveFilters = Boolean(
    debouncedSearch || activeModes.size > 0 || minMatch !== DEFAULT_MIN_MATCH || showSavedOnly,
  )
  const isFilteredEmpty = !isInitialLoading && jobs.length > 0 && filteredJobs.length === 0

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Centered responsive container: full width on mobile, capped max-width on desktop */}
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header section with live connection status pill and dynamic stats */}
        <header className="mb-6 flex flex-col gap-2 border-b border-border-soft pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold tracking-tight text-text">
                Pulseboard
              </h1>
              <ConnectionStatus connection={connection} />
              <button
                type="button"
                onClick={handleTogglePause}
                aria-label={isStreamPaused ? 'Resume live stream updates' : 'Pause live stream updates'}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal ${
                  isStreamPaused
                    ? 'bg-amber/15 text-amber border-amber/30 hover:bg-amber/25'
                    : 'bg-surface-raised text-text-muted hover:text-text border-border-soft hover:border-border'
                }`}
              >
                {isStreamPaused ? (
                  <>
                    <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 16 16" aria-hidden="true">
                      <polygon points="4,2 14,8 4,14" />
                    </svg>
                    Resume
                  </>
                ) : (
                  <>
                    <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 16 16" aria-hidden="true">
                      <rect x="3" y="3" width="3" height="10" rx="1" />
                      <rect x="10" y="3" width="3" height="10" rx="1" />
                    </svg>
                    Pause
                  </>
                )}
              </button>
            </div>
            <p className="mt-1 text-sm text-text-muted">
              Live engineering telemetry and real-time job stream
            </p>
          </div>

          <div className="mt-2 flex items-center gap-3 sm:mt-0">
            <span className="inline-flex items-center rounded-full bg-surface-raised px-3 py-1 text-xs font-medium text-text-muted border border-border-soft">
              {isInitialLoading ? 'Fetching...' : fetchError ? 'Offline' : `${jobs.length} roles active`}
            </span>
            {bufferedJobs.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-amber/15 px-3 py-1 text-xs font-medium text-amber border border-amber/30">
                {bufferedJobs.length} buffered
              </span>
            )}
            {savedIds.size > 0 && (
              <span className="inline-flex items-center rounded-full bg-signal/15 px-3 py-1 text-xs font-medium text-signal border border-signal/30">
                {savedIds.size} saved
              </span>
            )}
          </div>
        </header>

        {/* Your Profile Section: dynamically tailors match telemetry to candidate skills */}
        <section
          aria-labelledby="profile-heading"
          className="mb-4 rounded-xl border border-signal/25 bg-surface/80 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-signal/40"
        >
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <label
              id="profile-heading"
              htmlFor="profile-skills-input"
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-signal/15 text-signal border border-signal/30">
                <svg
                  className="h-3 w-3 stroke-current fill-none"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <span>Your Profile</span>
              <span className="text-[11px] font-normal normal-case text-text-muted">
                (powers dynamic match telemetry)
              </span>
            </label>

            <span className="text-[11px] text-text-faint hidden sm:inline">
              Type or paste skills to tailor scores
            </span>
          </div>

          <div className="relative">
            <Input
              id="profile-skills-input"
              type="text"
              value={profileInput}
              onChange={(e) => handleProfileChange(e.target.value)}
              placeholder="e.g. React, TypeScript, WebSockets, Go, Distributed Systems"
              aria-label="Your profile skills comma-separated"
              className="h-10 text-xs bg-background/70 border-border-soft focus-visible:ring-signal pr-8"
            />
            {profileInput.length > 0 && (
              <button
                type="button"
                onClick={handleClearProfile}
                aria-label="Clear profile skills"
                className="absolute inset-y-0 right-2 my-auto flex h-6 w-6 items-center justify-center rounded text-text-muted hover:text-text cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
              >
                <svg
                  className="h-3.5 w-3.5 stroke-current fill-none"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {profileSkills.length > 0 && (
            <div className="mt-3 flex flex-col gap-2 pt-2.5 border-t border-border-soft/60">
              {matchedProfileSkills.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-medium text-signal mr-0.5">Matched skills:</span>
                  {matchedProfileSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-md bg-signal/10 px-2 py-0.5 text-[11px] font-medium text-signal border border-signal/25"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {unmatchedProfileSkills.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-text-muted mr-0.5">No match found for:</span>
                  {unmatchedProfileSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-md bg-surface-raised/80 px-2 py-0.5 text-[11px] font-normal text-text-muted border border-border-soft"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Search & Filter controls */}
        <div className="mb-5 flex flex-col gap-3">
          <SearchBar value={searchInput} onChange={setSearchInput} />
          <FilterPanel
            activeModes={activeModes}
            onToggle={handleToggleMode}
            minMatch={minMatch}
            onMinMatchChange={setMinMatch}
            showSavedOnly={showSavedOnly}
            onToggleSavedOnly={handleToggleSavedOnly}
            savedCount={savedIds.size}
          />
        </div>

        {/* Count indicator above the feed */}
        <div className="mb-3 flex items-center justify-between text-xs text-text-muted px-0.5">
          <span>
            {isInitialLoading ? (
              <span>Loading telemetry feed...</span>
            ) : fetchError ? (
              <span className="text-red-soft font-medium">Connection failed</span>
            ) : (
              <span>
                Showing <strong className="font-semibold text-text">{filteredJobs.length}</strong> of{' '}
                <strong className="font-semibold text-text">{jobs.length}</strong> jobs
              </span>
            )}
          </span>
          {hasActiveFilters && !fetchError && (
            <button
              type="button"
              onClick={handleResetFilters}
              aria-label="Reset all search and filter settings"
              className="text-xs text-signal hover:underline cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded px-1"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Floating pill notification when incoming jobs are buffered while stream is paused */}
        {bufferedJobs.length > 0 && (
          <div className="sticky top-4 z-20 mb-3 flex justify-center">
            <button
              type="button"
              onClick={handleFlushBufferedJobs}
              className="inline-flex items-center gap-2 rounded-full bg-signal px-4 py-1.5 text-xs font-semibold text-background shadow-lg shadow-signal/25 transition-transform hover:scale-105 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
              aria-label={`${bufferedJobs.length} new ${bufferedJobs.length === 1 ? 'role' : 'roles'} arrived — click to load`}
            >
              <span className="h-2 w-2 rounded-full bg-background animate-pulse" />
              <span>
                {bufferedJobs.length} new {bufferedJobs.length === 1 ? 'role' : 'roles'} arrived — click to load
              </span>
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M8 12V4M4 8l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Virtualized Job Feed receiving live derived filteredJobs, loading state, error handling, and optimistic save states */}
        <ErrorBoundary>
          <JobFeed
            jobs={filteredJobs}
            isLoading={isInitialLoading}
            isFiltered={isFilteredEmpty}
            error={fetchError}
            onRetry={loadInitialJobs}
            onResetFilters={handleResetFilters}
            savedJobIds={savedIds}
            pendingSaveIds={pendingIds}
            newJobIds={newJobIds}
            onToggleSave={toggleSave}
            hasProfileSkills={profileSkills.length > 0}
          />
        </ErrorBoundary>
      </main>
    </div>
  )
}
