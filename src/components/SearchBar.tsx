import React from 'react'
import { Input } from './ui/Input'

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  className?: string
  inputRef?: React.RefObject<HTMLInputElement | null>
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  className = '',
  inputRef,
}) => {
  return (
    <div className={`relative w-full ${className}`.trim()}>
      {/* Magnifying-glass SVG icon inside on the left */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted">
        <svg
          className="h-4 w-4 stroke-current fill-none"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </div>

      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by title, company, or skill"
        aria-label="Search by title, company, or skill"
        className="pl-10 pr-10 h-10 text-sm bg-surface border-border focus-visible:ring-signal"
      />

      {/* Keyboard shortcut hint (Linear / GitHub style) when search is empty */}
      {value.length === 0 && (
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <kbd
            aria-hidden="true"
            className="hidden sm:inline-flex items-center justify-center h-5 w-5 rounded border border-border-soft bg-surface-raised text-[11px] font-mono font-medium text-text-muted select-none"
          >
            /
          </kbd>
        </div>
      )}

      {/* Clear button when search term is active */}
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search input (Esc)"
          title="Clear search (Esc)"
          className="absolute inset-y-0 right-2 my-auto flex h-7 w-7 items-center justify-center rounded text-text-muted hover:text-text cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
        >
          <svg
            className="h-4 w-4 stroke-current fill-none"
            width="16"
            height="16"
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
  )
}
