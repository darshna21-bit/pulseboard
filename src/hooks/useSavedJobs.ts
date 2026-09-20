import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseSavedJobsReturn {
  savedIds: Set<string>
  pendingIds: Set<string>
  toggleSave: (jobId: string) => void
}

/**
 * useSavedJobs
 * Manages job bookmarking using optimistic UI updates with automated
 * error rollback on simulated network mutation failures.
 */
export function useSavedJobs(): UseSavedJobsReturn {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())

  // Store active timer IDs for unmount cleanup
  const activeTimersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())
  const isUnmountedRef = useRef(false)

  useEffect(() => {
    isUnmountedRef.current = false
    const activeTimers = activeTimersRef.current

    return () => {
      isUnmountedRef.current = true
      activeTimers.forEach((timer) => clearTimeout(timer))
      activeTimers.clear()
    }
  }, [])

  const toggleSave = useCallback((jobId: string) => {
    // 1. Snapshot previous state before toggle
    let wasSavedSnapshot = false

    // 2. Optimistic Update: flip state immediately (0ms UI latency)
    setSavedIds((prev) => {
      wasSavedSnapshot = prev.has(jobId)
      const next = new Set(prev)
      if (wasSavedSnapshot) {
        next.delete(jobId)
      } else {
        next.add(jobId)
      }
      return next
    })

    // 3. Mark as pending network mutation
    setPendingIds((prev) => {
      const next = new Set(prev)
      next.add(jobId)
      return next
    })

    // 4. Simulate network latency between 350ms and 750ms
    const networkDelay = Math.floor(Math.random() * 400) + 350

    const timerId = setTimeout(() => {
      activeTimersRef.current.delete(timerId)
      if (isUnmountedRef.current) return

      // Remove from pending set
      setPendingIds((prev) => {
        const next = new Set(prev)
        next.delete(jobId)
        return next
      })

      // 5. Simulate occasional network failure (~4% chance)
      const isFailed = Math.random() < 0.04
      if (isFailed) {
        console.warn(
          `[useSavedJobs] Network mutation failed for job "${jobId}". Rolling back optimistic update.`,
        )
        // Rollback: restore previous snapshot
        setSavedIds((prev) => {
          const next = new Set(prev)
          if (wasSavedSnapshot) {
            next.add(jobId)
          } else {
            next.delete(jobId)
          }
          return next
        })
      }
    }, networkDelay)

    activeTimersRef.current.add(timerId)
  }, [])

  return { savedIds, pendingIds, toggleSave }
}
