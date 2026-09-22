import React from 'react'
import { Input } from './ui/Input'

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  className = '',
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
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by title, company, or skill"
        aria-label="Search by title, company, or skill"
        className="pl-10 pr-10 h-10 text-sm bg-surface border-border focus-visible:ring-signal"
      />

      {/* Clear button when search term is active */}
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search input"
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
