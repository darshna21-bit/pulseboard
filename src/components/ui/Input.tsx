import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={`w-full rounded-lg bg-surface border border-border px-3.5 py-2 text-sm text-text placeholder:text-text-faint transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:border-signal disabled:cursor-not-allowed disabled:opacity-50 ${className}`.trim()}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'
