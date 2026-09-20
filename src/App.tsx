import { useState } from 'react'
import type { Job } from './types/job'
import { generateInitialBatch } from './mocks/jobData'
import { JobFeed } from './components/JobFeed'

export default function App() {
  const [jobs] = useState<Job[]>(() => generateInitialBatch(40))
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set())

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

        {/* Static Job Feed */}
        <JobFeed
          jobs={jobs}
          savedJobIds={savedJobIds}
          onToggleSave={handleToggleSave}
        />
      </main>
    </div>
  )
}
