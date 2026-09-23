import React, { useEffect, useRef, useState } from 'react'
import type { Job } from '../types/job'
import { Badge, MatchBadge } from './ui/Badge'

export interface JobDetailDrawerProps {
  job: Job
  onClose: () => void
  isSaved: boolean
  isPending: boolean
  onToggleSave: (job: Job) => void
  hasProfileSkills?: boolean
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

function getRoleDescription(job: Job): string {
  const primaryTags = job.tags.slice(0, 3).join(', ')
  return `${job.company} is seeking an accomplished ${job.title} to join their engineering team in ${job.location} (${job.workMode}). In this role, you will be part of a high-velocity group designing, building, and deploying mission-critical systems utilizing ${primaryTags}. You will partner with cross-functional peers to scale architecture, refine developer experience, and maintain robust production standards.`
}

function getRoleResponsibilities(job: Job): string[] {
  const t0 = job.tags[0] ?? 'modern web architectures'
  const t1 = job.tags[1] ?? 'robust API integrations'
  const t2 = job.tags[2] ?? 'performance observability & testing'

  return [
    `Architect, deliver, and optimize high-throughput applications leveraging ${t0}.`,
    `Collaborate closely with product, engineering, and design to design intuitive interfaces backed by ${t1}.`,
    `Champion code quality, accessibility (WCAG AA), and continuous telemetry monitoring with ${t2}.`,
  ]
}

export const JobDetailDrawer: React.FC<JobDetailDrawerProps> = ({
  job,
  onClose,
  isSaved,
  isPending,
  onToggleSave,
  hasProfileSkills = false,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)
  const [showApplyNotice, setShowApplyNotice] = useState(false)

  // Focus trap & body scroll lock lifecycle
  useEffect(() => {
    previousActiveElementRef.current = document.activeElement as HTMLElement | null

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Shift initial focus to the close button inside the drawer
    const timer = setTimeout(() => {
      const focusable = drawerRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      focusable?.focus()
    }, 50)

    return () => {
      clearTimeout(timer)
      document.body.style.overflow = originalOverflow
      // Return focus to the triggering element
      previousActiveElementRef.current?.focus()
    }
  }, [])

  // Keyboard navigation: Escape to close and Tab key focus cycle
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onClose()
        return
      }

      if (event.key === 'Tab' && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )

        if (focusableElements.length === 0) {
          event.preventDefault()
          return
        }

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    // Capture phase intercepts before background global keyboard listeners
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [onClose])

  const titleId = `drawer-job-title-${job.id}`

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Semi-transparent backdrop with click-to-close */}
      <div
        className="fixed inset-0 bg-background/75 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex h-full w-full max-w-xl flex-col border-l border-border bg-surface shadow-2xl animate-slide-in-right text-text"
      >
        {/* Drawer Header */}
        <div className="border-b border-border-soft px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2
                id={titleId}
                className="font-display text-xl font-bold tracking-tight text-text break-words"
              >
                {job.title}
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                <span className="font-medium text-text">{job.company}</span>
                <span className="mx-2 text-text-faint">•</span>
                <span>{job.location}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <MatchBadge score={job.matchScore} isScored={hasProfileSkills} />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close job details"
                className="rounded-lg p-1.5 text-text-muted hover:bg-surface-raised hover:text-text transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
              >
                <svg
                  className="h-5 w-5 stroke-current fill-none"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quick telemetry badges */}
          <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs text-text-muted">
            <span className="rounded bg-surface-raised px-2.5 py-1 font-medium text-text border border-border-soft">
              {job.workMode}
            </span>
            <span className="rounded bg-surface-raised px-2.5 py-1 font-medium text-text border border-border-soft">
              {job.salaryRange}
            </span>
            <span className="text-text-faint">
              Posted {formatRelativeTime(job.postedAtMs)}
            </span>
            <span className="text-text-faint">•</span>
            <span className="text-text-faint font-mono text-[11px]">
              ID: {job.id}
            </span>
          </div>
        </div>

        {/* Drawer Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto job-feed-scroll px-6 py-6 space-y-6">
          {/* Skill Tags */}
          <section aria-labelledby="skills-heading">
            <h3 id="skills-heading" className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
              Target Technologies & Skills
            </h3>
            <div className="flex flex-wrap items-center gap-1.5">
              {job.tags.map((tag) => (
                <Badge key={tag} tone="neutral" className="text-xs py-1 px-2.5">
                  {tag}
                </Badge>
              ))}
            </div>
          </section>

          {/* About this role */}
          <section aria-labelledby="about-heading">
            <h3 id="about-heading" className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2.5">
              About This Role
            </h3>
            <p className="text-sm leading-relaxed text-text/90">
              {getRoleDescription(job)}
            </p>
          </section>

          {/* What you'll work on */}
          <section aria-labelledby="responsibilities-heading">
            <h3 id="responsibilities-heading" className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
              What You'll Work On
            </h3>
            <ul className="space-y-2.5 text-sm text-text/85">
              {getRoleResponsibilities(job).map((responsibility, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-signal shrink-0" aria-hidden="true" />
                  <span className="leading-relaxed">{responsibility}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Drawer Footer / Actions */}
        <div className="border-t border-border-soft bg-surface-raised/40 px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onToggleSave(job)}
              disabled={isPending}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium border transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal ${
                isSaved
                  ? 'border-signal/40 bg-signal/15 text-signal hover:bg-signal/25'
                  : 'border-border-soft bg-surface-raised text-text hover:bg-surface-raised/80 hover:border-border'
              }`}
            >
              <svg
                className={`h-4 w-4 ${isSaved ? 'fill-signal stroke-signal' : 'fill-none stroke-current'}`}
                viewBox="0 0 24 24"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              {isPending ? 'Updating...' : isSaved ? 'Saved' : 'Save Role'}
            </button>

            <button
              type="button"
              onClick={() => setShowApplyNotice(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-signal px-5 py-2.5 text-sm font-semibold text-background hover:bg-signal/90 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
            >
              Apply
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          {/* Cosmetic Apply Notice */}
          {showApplyNotice && (
            <div className="mt-3 flex items-start justify-between rounded-lg border border-signal/30 bg-signal/10 p-3 text-xs text-signal animate-fade-in">
              <span>This is a demonstration build. In production, this would route to the employer's application portal.</span>
              <button
                type="button"
                onClick={() => setShowApplyNotice(false)}
                aria-label="Dismiss notice"
                className="ml-2 text-signal/80 hover:text-signal cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
