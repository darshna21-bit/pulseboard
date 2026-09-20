import React from 'react'
import type { Job } from '../types/job'
import { JobCard } from './JobCard'
import { Card } from './ui/Card'
import { JobCardSkeleton } from './ui/Skeleton'

export interface JobFeedProps {
  jobs: Job[]
  isLoading?: boolean
  savedJobIds?: Set<string>
  pendingSaveIds?: Set<string>
  newJobIds?: Set<string>
  onToggleSave?: (id: string) => void
  className?: string
}

export const JobFeed: React.FC<JobFeedProps> = ({
  jobs,
  isLoading = false,
  savedJobIds = new Set(),
  pendingSaveIds = new Set(),
  newJobIds = new Set(),
  onToggleSave = () => {},
  className = '',
}) => {
  // Loading state: render 4 skeleton placeholders
  if (isLoading) {
    return (
      <div className={`flex flex-col gap-4 ${className}`.trim()} role="status" aria-label="Loading jobs">
        <JobCardSkeleton />
        <JobCardSkeleton />
        <JobCardSkeleton />
        <JobCardSkeleton />
      </div>
    )
  }

  // Empty state: displayed when not loading and job list is empty
  if (jobs.length === 0) {
    return (
      <Card className={`text-center py-12 px-6 flex flex-col items-center justify-center ${className}`.trim()}>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-raised text-signal mb-3 border border-border-soft">
          <svg
            className="h-6 w-6 stroke-current fill-none"
            viewBox="0 0 24 24"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <h3 className="font-display text-base font-semibold text-text">No jobs in feed</h3>
        <p className="mt-1.5 max-w-sm text-sm text-text-muted">
          Waiting for live telemetry updates. Incoming engineering positions will stream directly into this feed.
        </p>
      </Card>
    )
  }

  // Active list state
  return (
    <div className={`flex flex-col gap-4 ${className}`.trim()} role="feed" aria-label="Job listings feed">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          isSaved={savedJobIds.has(job.id)}
          isPending={pendingSaveIds.has(job.id)}
          isNew={newJobIds.has(job.id)}
          onToggleSave={onToggleSave}
        />
      ))}
    </div>
  )
}
