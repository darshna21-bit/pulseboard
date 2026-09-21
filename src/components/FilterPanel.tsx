import React from 'react'
import type { WorkMode } from '../types/job'

export interface FilterPanelProps {
  activeModes: Set<WorkMode>
  onToggle: (mode: WorkMode) => void
  minMatch: number
  onMinMatchChange: (value: number) => void
  showSavedOnly?: boolean
  onToggleSavedOnly?: () => void
  savedCount?: number
  className?: string
}

const WORK_MODES: WorkMode[] = ['Remote', 'Hybrid', 'On-site']

export const FilterPanel: React.FC<FilterPanelProps> = ({
  activeModes,
  onToggle,
  minMatch,
  onMinMatchChange,
  showSavedOnly = false,
  onToggleSavedOnly,
  savedCount,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-surface/60 border border-border-soft p-3.5 ${className}`.trim()}
    >
      {/* Work-mode filter chips & Saved filter */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by work mode and saved status">
        <span className="text-xs font-medium text-text-muted mr-1">Work Mode:</span>
        {WORK_MODES.map((mode) => {
          const isActive = activeModes.has(mode)
          return (
            <button
              key={mode}
              type="button"
              onClick={() => onToggle(mode)}
              aria-pressed={isActive}
              className={`inline-flex items-center rounded-lg px-3 py-1 text-xs font-medium border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                isActive
                  ? 'bg-signal/15 text-signal border-signal/40 shadow-sm'
                  : 'bg-surface-raised text-text-muted border-border-soft hover:text-text hover:border-border'
              }`}
            >
              {mode}
            </button>
          )
        })}

        {onToggleSavedOnly && (
          <>
            <span className="mx-0.5 h-3.5 w-px bg-border-soft" aria-hidden="true" />
            <button
              type="button"
              onClick={onToggleSavedOnly}
              aria-pressed={showSavedOnly}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                showSavedOnly
                  ? 'bg-signal/15 text-signal border-signal/40 shadow-sm'
                  : 'bg-surface-raised text-text-muted border-border-soft hover:text-text hover:border-border'
              }`}
            >
              <svg
                className={`h-3.5 w-3.5 stroke-current ${showSavedOnly ? 'fill-current' : 'fill-none'}`}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              <span>Saved</span>
              {typeof savedCount === 'number' && savedCount > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                    showSavedOnly
                      ? 'bg-signal text-background'
                      : 'bg-surface-raised text-text-muted border border-border-soft'
                  }`}
                >
                  {savedCount}
                </span>
              )}
            </button>
          </>
        )}
      </div>

      {/* Minimum-match-score range slider */}
      <div className="flex items-center gap-3 border-t border-border-soft/60 pt-2.5 sm:border-t-0 sm:pt-0">
        <label htmlFor="min-match-slider" className="text-xs font-medium text-text-muted whitespace-nowrap">
          Min Match:{' '}
          <span className="font-mono font-semibold text-signal ml-1">
            {minMatch}%
          </span>
        </label>
        <input
          id="min-match-slider"
          type="range"
          min={0}
          max={95}
          step={5}
          value={minMatch}
          onChange={(e) => onMinMatchChange(Number(e.target.value))}
          aria-label="Minimum match score filter"
          aria-valuemin={0}
          aria-valuemax={95}
          aria-valuenow={minMatch}
          aria-valuetext={`${minMatch}% match`}
          className="h-1.5 w-28 sm:w-32 cursor-pointer accent-signal bg-surface-raised rounded-lg appearance-none border border-border-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
      </div>
    </div>
  )
}
