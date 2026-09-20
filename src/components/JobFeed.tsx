import React, { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
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
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: jobs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 190,
    overscan: 6,
  })

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

  // Virtualized list state
  return (
    <div
      ref={parentRef}
      className={`overflow-y-auto h-[calc(100vh-280px)] min-h-[420px] rounded-xl pr-1 focus:outline-none ${className}`.trim()}
      role="feed"
      aria-label="Job listings feed"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const job = jobs[virtualItem.index]
          return (
            <div
              key={job.id}
              data-index={virtualItem.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
                paddingBottom: '16px',
              }}
            >
              <JobCard
                job={job}
                isSaved={savedJobIds.has(job.id)}
                isPending={pendingSaveIds.has(job.id)}
                isNew={newJobIds.has(job.id)}
                onToggleSave={onToggleSave}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
