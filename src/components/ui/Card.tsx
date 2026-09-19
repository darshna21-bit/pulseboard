import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-surface border border-border-soft rounded-xl p-5 shadow-sm transition-colors ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    )
  },
)

Card.displayName = 'Card'
