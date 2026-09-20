import React from 'react'
import type { Job } from '../types/job'
import { Badge, MatchBadge } from './ui/Badge'
import { Card } from './ui/Card'

export interface JobCardProps {
  job: Job
  isSaved: boolean
  isPending: boolean
  isNew: boolean
  onToggleSave: (id: string) => void
}

function formatRelativeTime(timestampMs: number): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - timestampMs) / 1000))
  if (diffSec < 60) return 'just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}h ago`
  const diffDay = Math.floor(diffHour / 24)
  return `${diffDay}d ago`
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isSaved,
  isPending,
  isNew,
  onToggleSave,
}) => {
  const newCardStyles = isNew
    ? 'border-signal/40 bg-surface-raised/40 ring-1 ring-signal/20'
    : 'border-border-soft bg-surface'

  return (
    <Card
      className={`relative transition-all duration-200 hover:border-border ${newCardStyles}`}
    >
      {/* Top row: Title, company/location, and MatchBadge */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-semibold tracking-tight text-text truncate">
              {job.title}
            </h3>
            {isNew && (
              <span className="inline-flex items-center rounded-full bg-signal/15 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-signal uppercase">
                New
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-text-muted">
            <span className="font-medium text-text">{job.company}</span>
            <span className="mx-1.5 text-text-faint">•</span>
            <span>{job.location}</span>
          </p>
        </div>

        <div className="shrink-0">
          <MatchBadge score={job.matchScore} />
        </div>
      </div>

      {/* Middle row: Skill tags */}
      <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
        {job.tags.map((tag) => (
          <Badge key={tag} tone="neutral" className="text-[11px] py-0.5 px-2">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Bottom row: Work mode, salary, relative time, and save bookmark */}
      <div className="mt-4 flex items-center justify-between border-t border-border-soft/60 pt-3 text-xs text-text-muted">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded bg-surface-raised px-2 py-0.5 font-medium text-text">
            {job.workMode}
          </span>
          <span className="font-medium text-text">{job.salaryRange}</span>
          <span className="text-text-faint">•</span>
          <span className="text-text-faint">
            posted {formatRelativeTime(job.postedAtMs)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onToggleSave(job.id)}
          disabled={isPending}
          aria-label={
            isSaved
              ? `Remove ${job.title} at ${job.company} from saved jobs`
              : `Save ${job.title} at ${job.company}`
          }
          className={`inline-flex items-center justify-center rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-raised hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
            isSaved ? 'text-signal hover:text-signal' : ''
          }`}
        >
          <svg
            className={`h-5 w-5 ${isSaved ? 'fill-signal stroke-signal' : 'fill-none stroke-current'}`}
            viewBox="0 0 24 24"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>
    </Card>
  )
}
