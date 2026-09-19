import React from 'react'

export type BadgeTone = 'neutral' | 'signal' | 'amber' | 'muted'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  children: React.ReactNode
}

export const Badge: React.FC<BadgeProps> = ({
  tone = 'neutral',
  className = '',
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors'

  const toneStyles: Record<BadgeTone, string> = {
    neutral: 'bg-surface-raised text-text border border-border-soft',
    signal: 'bg-signal/15 text-signal border border-signal/30',
    amber: 'bg-amber/15 text-amber border border-amber/30',
    muted: 'bg-surface-raised text-text-muted border border-border-soft',
  }

  return (
    <span
      className={`${baseStyles} ${toneStyles[tone]} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  )
}

export interface MatchBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  score: number
}

export const MatchBadge: React.FC<MatchBadgeProps> = ({
  score,
  className = '',
  ...props
}) => {
  const getTone = (val: number): BadgeTone => {
    if (val >= 85) return 'signal'
    if (val >= 70) return 'amber'
    return 'muted'
  }

  const tone = getTone(score)

  return (
    <Badge tone={tone} className={`font-mono ${className}`.trim()} {...props}>
      {score}% match
    </Badge>
  )
}
