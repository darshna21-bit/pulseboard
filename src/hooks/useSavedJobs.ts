import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Job } from '../types/job'

export interface UseSavedJobsReturn {
  savedIds: Set<string>
  savedJobs: Job[]
  pendingIds: Set<string>
  toggleSave: (job: Job | string) => void
}

const STORAGE_KEY = 'pulseboard:savedJobs'

function getInitialSavedJobs(): Map<string, Job> {
  if (typeof window === 'undefined') return new Map()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Map()
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      const map = new Map<string, Job>()
      for (const item of parsed) {
        if (item && typeof item === 'object' && typeof item.id === 'string') {
          map.set(item.id, item as Job)
        }
      }
      return map
    }
  } catch (err) {
    console.warn('[useSavedJobs] Failed to load saved jobs from localStorage:', err)
  }
  return new Map()
}

/**
 * useSavedJobs
 * Manages job bookmarking using optimistic UI updates with automated
 * error rollback on simulated network mutation failures, persisting
 * full Job objects to localStorage so saved jobs persist across sessions.
 */
export function useSavedJobs(): UseSavedJobsReturn {
  const [savedMap, setSavedMap] = useState<Map<string, Job>>(getInitialSavedJobs)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())

  const savedIds = useMemo(() => new Set(savedMap.keys()), [savedMap])
  const savedJobs = useMemo(() => Array.from(savedMap.values()), [savedMap])

  // Persist full Job objects to localStorage whenever savedMap changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(savedMap.values())))
    } catch (err) {
      console.warn('[useSavedJobs] Failed to persist saved jobs to localStorage:', err)
    }
  }, [savedMap])

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

  const toggleSave = useCallback((jobOrId: Job | string) => {
    const jobId = typeof jobOrId === 'string' ? jobOrId : jobOrId.id
    const jobObj = typeof jobOrId === 'string' ? null : jobOrId

    // 1. Snapshot previous state before toggle
    let wasSavedSnapshot = false
    let previousJobSnapshot: Job | undefined

    // 2. Optimistic Update: flip state immediately (0ms UI latency)
    setSavedMap((prev) => {
      wasSavedSnapshot = prev.has(jobId)
      previousJobSnapshot = prev.get(jobId)
      const next = new Map(prev)
      if (wasSavedSnapshot) {
        next.delete(jobId)
      } else if (jobObj) {
        next.set(jobId, jobObj)
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
        setSavedMap((prev) => {
          const next = new Map(prev)
          if (wasSavedSnapshot && previousJobSnapshot) {
            next.set(jobId, previousJobSnapshot)
          } else {
            next.delete(jobId)
          }
          return next
        })
      }
    }, networkDelay)

    activeTimersRef.current.add(timerId)
  }, [])

  return { savedIds, savedJobs, pendingIds, toggleSave }
}
