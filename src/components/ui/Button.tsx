import React from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 cursor-pointer disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-background'

    const variantStyles: Record<ButtonVariant, string> = {
      primary: 'bg-signal text-background hover:bg-signal/90 font-semibold shadow-sm',
      secondary:
        'bg-surface-raised text-text border border-border hover:bg-surface-raised/80 hover:border-border/80',
      ghost:
        'bg-transparent text-text-muted hover:text-text hover:bg-surface-raised/60',
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`.trim()}
        {...props}
      >
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
