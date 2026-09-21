import React from 'react'
import type { ConnectionState } from '../types/job'

export interface ConnectionStatusProps {
  connection: ConnectionState
  className?: string
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  connection,
  className = '',
}) => {
  const getStatusConfig = () => {
    switch (connection) {
      case 'live':
        return {
          label: 'Live',
          badgeStyles: 'bg-signal/15 text-signal border-signal/30',
          dotStyles: 'bg-signal',
          hasPulseRing: true,
        }
      case 'connecting':
        return {
          label: 'Connecting...',
          badgeStyles: 'bg-amber/15 text-amber border-amber/30',
          dotStyles: 'bg-amber animate-pulse',
          hasPulseRing: false,
        }
      case 'reconnecting':
        return {
          label: 'Reconnecting...',
          badgeStyles: 'bg-amber/15 text-amber border-amber/30',
          dotStyles: 'bg-amber animate-pulse',
          hasPulseRing: false,
        }
      case 'offline':
      default:
        return {
          label: 'Offline',
          badgeStyles: 'bg-red-soft/15 text-red-soft border-red-soft/30',
          dotStyles: 'bg-red-soft',
          hasPulseRing: false,
        }
    }
  }

  const { label, badgeStyles, dotStyles, hasPulseRing } = getStatusConfig()

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Connection status: ${label}`}
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium border transition-colors ${badgeStyles} ${className}`.trim()}
    >
      <span className="relative flex h-2 w-2">
        {hasPulseRing && (
          <>
            {/* Primary fast pulse ring */}
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
            {/* Secondary slower offset outer radar ring for authentic live heartbeat */}
            <span className="absolute inline-flex h-full w-full animate-ping-slow rounded-full bg-signal opacity-50" />
          </>
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${dotStyles}`} />
      </span>
      <span>{label}</span>
    </div>
  )
}
