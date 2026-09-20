import { useMemo, useState } from 'react'
import type { Job, WorkMode } from './types/job'
import { generateInitialBatch } from './mocks/jobData'
import { JobFeed } from './components/JobFeed'
import { SearchBar } from './components/SearchBar'
import { FilterPanel } from './components/FilterPanel'
import { useDebounce } from './hooks/useDebounce'

export default function App() {
  const [jobs] = useState<Job[]>(() => generateInitialBatch(40))
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set())

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

  const handleToggleSave = (id: string) => {
    setSavedJobIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
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

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Centered responsive container: full width with comfortable padding on mobile, capped max-width on desktop */}
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header section */}
        <header className="mb-6 flex flex-col gap-1 border-b border-border-soft pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-text">
              Pulseboard
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              Live engineering telemetry and real-time job stream
            </p>
          </div>

          <div className="mt-3 flex items-center gap-3 sm:mt-0">
            <span className="inline-flex items-center rounded-full bg-surface-raised px-3 py-1 text-xs font-medium text-text-muted border border-border-soft">
              {jobs.length} roles active
            </span>
            {savedJobIds.size > 0 && (
              <span className="inline-flex items-center rounded-full bg-signal/15 px-3 py-1 text-xs font-medium text-signal border border-signal/30">
                {savedJobIds.size} saved
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
            Showing <strong className="font-semibold text-text">{filteredJobs.length}</strong> of{' '}
            <strong className="font-semibold text-text">{jobs.length}</strong> jobs
          </span>
          {(debouncedSearch || activeModes.size > 0 || minMatch > 0) && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('')
                setActiveModes(new Set())
                setMinMatch(0)
              }}
              className="text-xs text-signal hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-signal rounded"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Virtualized Job Feed receiving derived filteredJobs */}
        <JobFeed
          jobs={filteredJobs}
          savedJobIds={savedJobIds}
          onToggleSave={handleToggleSave}
        />
      </main>
    </div>
  )
}
