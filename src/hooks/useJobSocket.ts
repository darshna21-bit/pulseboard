import { useEffect, useRef, useState } from 'react'
import type { ConnectionState, Job } from '../types/job'
import { MockJobSocket } from '../mocks/mockServer'

// Union type allowing polymorphic substitution between MockJobSocket and browser WebSocket
type JobWebSocket = MockJobSocket | WebSocket

/**
 * useJobSocket
 * Owns the real-time WebSocket connection lifecycle, ingestion stream,
 * and resilient exponential backoff auto-reconnect logic.
 *
 * NOTE FOR PRODUCTION DEPLOYMENT:
 * Swapping `new MockJobSocket()` for `new WebSocket(url)` here is the
 * ONLY place that needs to change across the entire application codebase
 * to go live with a real production backend.
 */
export function useJobSocket(onJob: (job: Job) => void): { connection: ConnectionState } {
  const [connection, setConnection] = useState<ConnectionState>('connecting')

  // Stale closure prevention: keep the latest onJob callback in a ref
  // so consumer components don't trigger socket teardowns when passing unmemoized callbacks
  const onJobRef = useRef(onJob)
  useEffect(() => {
    onJobRef.current = onJob
  }, [onJob])

  const socketRef = useRef<JobWebSocket | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const attemptCountRef = useRef(0)
  const isUnmountedRef = useRef(false)

  useEffect(() => {
    isUnmountedRef.current = false

    function connect() {
      if (isUnmountedRef.current) return

      // Swapping `new MockJobSocket()` for `new WebSocket(url)` here is the only place that needs to change to go live.
      const socket: JobWebSocket = new MockJobSocket()
      socketRef.current = socket

      socket.onopen = () => {
        if (isUnmountedRef.current) return
        setConnection('live')
        // Reset attempt counter back to 0 once connection successfully opens
        attemptCountRef.current = 0
      }

      socket.onmessage = (event: MessageEvent) => {
        if (isUnmountedRef.current) return
        try {
          const payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
          const job = payload as Job
          onJobRef.current(job)
        } catch (err) {
          console.error('[useJobSocket] Failed to parse incoming job payload:', err)
        }
      }

      socket.onclose = () => {
        if (isUnmountedRef.current) return

        setConnection('reconnecting')

        // Exponential backoff: 1000 * 2^attempt ms, capped at 16000ms
        const delay = Math.min(1000 * Math.pow(2, attemptCountRef.current), 16000)
        attemptCountRef.current += 1

        reconnectTimerRef.current = setTimeout(() => {
          if (!isUnmountedRef.current) {
            connect()
          }
        }, delay)
      }

      socket.onerror = (err: Event) => {
        if (isUnmountedRef.current) return
        console.warn('[useJobSocket] Socket encountered an error:', err)
      }
    }

    connect()

    return () => {
      // Unmount cleanup: close socket and clear any pending reconnect timer
      // to avoid memory leaks or reconnecting after the component is gone
      isUnmountedRef.current = true
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
      if (socketRef.current) {
        socketRef.current.close()
        socketRef.current = null
      }
    }
  }, [])

  return { connection }
}
