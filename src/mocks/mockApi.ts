/**
 * ARCHITECTURAL CONTRACT:
 * `mockApi.ts` simulates a real-world asynchronous REST API client for Pulseboard.
 *
 * Just as `MockJobSocket` mirrors the browser's native WebSocket API with realistic
 * handshakes, frame streaming, and chaos drops, `fetchInitialJobs` mirrors a production
 * HTTP REST client (`fetch('/api/jobs')` or Axios/TanStack Query):
 *   - Encapsulated in a standard Promise<Job[]> abstraction
 *   - Introduces authentic asynchronous network latency (500–800ms)
 *   - Occasionally injects a simulated transient network failure (~2% probability)
 *     to exercise client-side try/catch error boundaries and retry mechanics
 *   - Returns freshly generated batch data from `generateInitialBatch(count)`
 *
 * This keeps Version 1 (main) 100% self-contained and offline-capable while fully
 * demonstrating both core patterns: REST for initial bulk snapshot retrieval and
 * WebSocket for live incremental stream updates.
 */

import type { Job } from '../types/job'
import { generateInitialBatch } from './jobData'

export interface FetchJobsOptions {
  /** Simulated failure rate between 0.0 and 1.0 (defaults to 0.02 = 2%) */
  failureRate?: number
  /** Minimum network latency in milliseconds (defaults to 500ms) */
  minLatencyMs?: number
  /** Maximum network latency in milliseconds (defaults to 800ms) */
  maxLatencyMs?: number
}

/**
 * Simulates an asynchronous REST GET endpoint `/api/jobs?limit={count}`.
 *
 * @param count - Number of job listings to retrieve in the initial snapshot (default: 24)
 * @param options - Optional simulation controls (latency, failure rate)
 * @returns Promise resolving to an array of Job objects
 * @throws Error on simulated network/HTTP failures
 */
export function fetchInitialJobs(
  count: number = 24,
  options: FetchJobsOptions = {},
): Promise<Job[]> {
  const {
    failureRate = 0.02,
    minLatencyMs = 500,
    maxLatencyMs = 800,
  } = options

  return new Promise((resolve, reject) => {
    // Realistic simulated HTTP network latency window
    const latency = Math.floor(Math.random() * (maxLatencyMs - minLatencyMs)) + minLatencyMs

    setTimeout(() => {
      // Occasional simulated network/server failure (~2% probability)
      // to exercise UI error handling and user retry flows
      if (Math.random() < failureRate) {
        reject(
          new Error(
            'Failed to fetch initial jobs: Simulated network connection timeout (HTTP 503 Service Unavailable)',
          ),
        )
        return
      }

      // Resolve with freshly generated batch
      const jobs = generateInitialBatch(count)
      resolve(jobs)
    }, latency)
  })
}
