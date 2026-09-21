import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Job, WorkMode } from './types/job'
import { generateInitialBatch } from './mocks/jobData'
import { JobFeed } from './components/JobFeed'
import { SearchBar } from './components/SearchBar'
import { FilterPanel } from './components/FilterPanel'
import { ConnectionStatus } from './components/ConnectionStatus'
import { useDebounce } from './hooks/useDebounce'
import { useJobSocket } from './hooks/useJobSocket'
import { useSavedJobs } from './hooks/useSavedJobs'

export default function App() {
  // Realistic initial loading simulation (shows skeletons for ~650ms)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [jobs, setJobs] = useState<Job[]>([])
  const [newJobIds, setNewJobIds] = useState<Set<string>>(new Set())

  // Initial fetch simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setJobs((prev) => {
        const initial = generateInitialBatch(15)
        const existingIds = new Set(prev.map((j) => j.id))
        const deduplicated = initial.filter((j) => !existingIds.has(j.id))
        return [...prev, ...deduplicated].slice(0, 400)
      })
      setIsInitialLoading(false)
    }, 650) // 500-800ms loading realism window

    return () => clearTimeout(timer)
  }, [])

  // Timers to clear the temporary "isNew" highlight after ~4 seconds
  const newJobTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    const timers = newJobTimersRef.current
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
    }
  }, [])

  // Callback for live incoming WebSocket jobs
  const handleNewJob = useCallback((incomingJob: Job) => {
    setJobs((prev) => {
      // Prevent duplicate job IDs in telemetry
      if (prev.some((j) => j.id === incomingJob.id)) return prev
      return [incomingJob, ...prev].slice(0, 400)
    })

    // Highlight card with isNew for ~4 seconds
    setNewJobIds((prev) => {
      const next = new Set(prev)
      next.add(incomingJob.id)
      return next
    })

    const timer = setTimeout(() => {
      setNewJobIds((prev) => {
        const next = new Set(prev)
        next.delete(incomingJob.id)
        return next
      })
      newJobTimersRef.current.delete(incomingJob.id)
    }, 4000)

    newJobTimersRef.current.set(incomingJob.id, timer)
  }, [])

  // Owns real-time connection lifecycle & auto-reconnect backoff
  const { connection } = useJobSocket(handleNewJob)

  // Owns optimistic bookmark state with automated error rollback
  const { savedIds, pendingIds, toggleSave } = useSavedJobs()

  // Search & Filter state
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)
  const [activeModes, setActiveModes] = useState<Set<WorkMode>>(new Set())
  const [minMatch, setMinMatch] = useState<number>(0)

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

  const handleResetFilters = () => {
    setSearchInput('')
    setActiveModes(new Set())
    setMinMatch(0)
  }

  // Derive filtered jobs with useMemo
  const filteredJobs = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase()

    return jobs.filter((job) => {
      // 1. Min match score filter
      if (job.matchScore < minMatch) return false

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
  }, [jobs, debouncedSearch, activeModes, minMatch])

  const hasActiveFilters = Boolean(debouncedSearch || activeModes.size > 0 || minMatch > 0)
  const isFilteredEmpty = !isInitialLoading && jobs.length > 0 && filteredJobs.length === 0

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Centered responsive container: full width on mobile, capped max-width on desktop */}
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header section with live connection status pill and dynamic stats */}
        <header className="mb-6 flex flex-col gap-2 border-b border-border-soft pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold tracking-tight text-text">
                Pulseboard
              </h1>
              <ConnectionStatus connection={connection} />
            </div>
            <p className="mt-1 text-sm text-text-muted">
              Live engineering telemetry and real-time job stream
            </p>
          </div>

          <div className="mt-2 flex items-center gap-3 sm:mt-0">
            <span className="inline-flex items-center rounded-full bg-surface-raised px-3 py-1 text-xs font-medium text-text-muted border border-border-soft">
              {isInitialLoading ? 'Fetching...' : `${jobs.length} roles active`}
            </span>
            {savedIds.size > 0 && (
              <span className="inline-flex items-center rounded-full bg-signal/15 px-3 py-1 text-xs font-medium text-signal border border-signal/30">
                {savedIds.size} saved
              </span>
            )}
          </div>
        </header>

        {/* Search & Filter controls */}
        <div className="mb-5 flex flex-col gap-3">
          <SearchBar value={searchInput} onChange={setSearchInput} />
          <FilterPanel
            activeModes={activeModes}
            onToggle={handleToggleMode}
            minMatch={minMatch}
            onMinMatchChange={setMinMatch}
          />
        </div>

        {/* Count indicator above the feed */}
        <div className="mb-3 flex items-center justify-between text-xs text-text-muted px-0.5">
          <span>
            {isInitialLoading ? (
              <span>Loading telemetry feed...</span>
            ) : (
              <span>
                Showing <strong className="font-semibold text-text">{filteredJobs.length}</strong> of{' '}
                <strong className="font-semibold text-text">{jobs.length}</strong> jobs
              </span>
            )}
          </span>
          {hasActiveFilters && (
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

        {/* Virtualized Job Feed receiving live derived filteredJobs, loading state, and optimistic save states */}
        <JobFeed
          jobs={filteredJobs}
          isLoading={isInitialLoading}
          isFiltered={isFilteredEmpty}
          onResetFilters={handleResetFilters}
          savedJobIds={savedIds}
          pendingSaveIds={pendingIds}
          newJobIds={newJobIds}
          onToggleSave={toggleSave}
        />
      </main>
    </div>
  )
}
