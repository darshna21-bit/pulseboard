import React, { useLayoutEffect, useRef, useState } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import type { Job } from '../types/job'
import { JobCard } from './JobCard'
import { Card } from './ui/Card'
import { JobCardSkeleton } from './ui/Skeleton'

export interface JobFeedProps {
  jobs: Job[]
  isLoading?: boolean
  isFiltered?: boolean
  onResetFilters?: () => void
  savedJobIds?: Set<string>
  pendingSaveIds?: Set<string>
  newJobIds?: Set<string>
  onToggleSave?: (job: Job) => void
  onOpenDetail?: (job: Job) => void
  hasProfileSkills?: boolean
  className?: string
  error?: string | null
  onRetry?: () => void
}

export const JobFeed: React.FC<JobFeedProps> = ({
  jobs,
  isLoading = false,
  isFiltered = false,
  onResetFilters,
  savedJobIds = new Set(),
  pendingSaveIds = new Set(),
  newJobIds = new Set(),
  onToggleSave = () => {},
  onOpenDetail,
  hasProfileSkills = false,
  className = '',
  error = null,
  onRetry,
}) => {
  const parentRef = useRef<HTMLDivElement>(null)
  const [scrollMargin, setScrollMargin] = useState(0)

  // Measure the container's offset relative to the document for accurate window virtualization
  useLayoutEffect(() => {
    const updateScrollMargin = () => {
      if (parentRef.current) {
        setScrollMargin(parentRef.current.offsetTop)
      }
    }
    updateScrollMargin()
    window.addEventListener('resize', updateScrollMargin)
    return () => window.removeEventListener('resize', updateScrollMargin)
  }, [jobs.length, isFiltered])

  const rowVirtualizer = useWindowVirtualizer({
    count: jobs.length,
    estimateSize: () => 190,
    overscan: 6,
    scrollMargin,
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

  // Error state: displayed when initial or retry fetch encounters a network failure
  if (error) {
    return (
      <Card className={`text-center py-12 px-6 flex flex-col items-center justify-center border-red-soft/30 bg-surface/90 ${className}`.trim()}>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-soft/15 text-red-soft mb-3 border border-red-soft/30">
          <svg
            className="h-6 w-6 stroke-current fill-none"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="font-display text-base font-semibold text-text">
          Couldn't load jobs — check your connection
        </h2>
        <p className="mt-1.5 max-w-sm text-sm text-text-muted">
          {error}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center rounded-lg bg-surface-raised px-4 py-1.5 text-xs font-medium text-signal border border-signal/30 hover:bg-signal/15 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
          >
            Retry
          </button>
        )}
      </Card>
    )
  }

  // Empty state: displayed when not loading and job list is empty
  if (jobs.length === 0) {
    return (
      <Card className={`text-center py-12 px-6 flex flex-col items-center justify-center ${className}`.trim()}>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-raised text-signal mb-3 border border-border-soft">
          <svg
            className="h-6 w-6 stroke-current fill-none"
            width="24"
            height="24"
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
        <h2 className="font-display text-base font-semibold text-text">
          {isFiltered ? 'No matching roles found' : 'No jobs in feed'}
        </h2>
        <p className="mt-1.5 max-w-sm text-sm text-text-muted">
          {isFiltered
            ? 'No engineering jobs match your current search and filter criteria. Try adjusting keywords, lowering the match threshold, or selecting additional work modes.'
            : 'Waiting for live telemetry updates. Incoming engineering positions will stream directly into this feed.'}
        </p>
        {isFiltered && onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-4 inline-flex items-center rounded-lg bg-surface-raised px-3.5 py-1.5 text-xs font-medium text-signal border border-signal/30 hover:bg-signal/15 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
          >
            Reset all filters
          </button>
        )}
      </Card>
    )
  }

  // Virtualized list state rendered in natural window scroll
  return (
    <div
      ref={parentRef}
      className={`relative w-full ${className}`.trim()}
      role="feed"
      aria-label="Job listings feed"
      aria-busy={isLoading}
    >
      <div
        role="presentation"
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
              role="presentation"
              data-index={virtualItem.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start - rowVirtualizer.options.scrollMargin}px)`,
                paddingBottom: '16px',
              }}
            >
              <JobCard
                job={job}
                isSaved={savedJobIds.has(job.id)}
                isPending={pendingSaveIds.has(job.id)}
                isNew={newJobIds.has(job.id)}
                onToggleSave={onToggleSave}
                onOpenDetail={onOpenDetail}
                hasProfileSkills={hasProfileSkills}
                ariaPosInset={virtualItem.index + 1}
                ariaSetSize={jobs.length}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
