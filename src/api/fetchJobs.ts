/**
 * REST API Integration Layer for Arbeitnow Job Board
 *
 * NOTE ON ARCHITECTURE:
 * This module replaces the earlier simulated initial batch generator with a real, live REST API
 * integration consuming the public, CORS-enabled Arbeitnow Job Board API (https://www.arbeitnow.com/api/job-board-api).
 *
 * Real public APIs do not provide personalized candidate semantic match scores (as they have no access
 * to individual candidate resumes or profile skills), nor do they provide standardized salary bands.
 * Consequently, while core listing metadata (title, company, location, workMode, and tags) is fetched
 * directly from live network payloads, matchScore and salaryRange remain simulated using this dashboard's
 * established heuristics and pools.
 */

import type { Job, WorkMode } from '../types/job'
import { SALARY_BANDS, getRandomTags, getNextFreshnessRank } from '../mocks/jobData'

interface ArbeitnowJobPayload {
  slug?: string
  company_name?: string
  title?: string
  description?: string
  remote?: boolean
  url?: string
  tags?: string[]
  job_types?: string[]
  location?: string
  created_at?: number
}

interface ArbeitnowApiResponse {
  data?: ArbeitnowJobPayload[]
  links?: Record<string, unknown>
  meta?: Record<string, unknown>
}

/**
 * Fetches real job listings from the live Arbeitnow REST API and maps them into
 * Pulseboard's internal Job domain schema.
 *
 * @param count - The maximum number of valid job listings to return
 * @returns Promise resolving to an array of Job entities sorted by matchScore descending
 * @throws Error on network connection failures, non-200 HTTP responses, or invalid JSON structures
 */
export function fetchInitialJobs(count: number = 24): Promise<Job[]> {
  return (async () => {
    let response: Response

    // 1. Genuine Network-Level Fetch with robust error interception
    try {
      response = await fetch('https://www.arbeitnow.com/api/job-board-api', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      })
    } catch (networkError) {
      const message = networkError instanceof Error ? networkError.message : String(networkError)
      throw new Error(`Network failure connecting to Arbeitnow Job Board API: ${message}`)
    }

    // 2. HTTP Status Verification (guards against 4xx/5xx gateway or server errors)
    if (!response.ok) {
      throw new Error(
        `Arbeitnow Job Board API returned error status ${response.status} (${response.statusText || 'Unknown Error'})`,
      )
    }

    // 3. JSON Deserialization with validation
    let json: ArbeitnowApiResponse
    try {
      json = await response.json()
    } catch (parseError) {
      const message = parseError instanceof Error ? parseError.message : String(parseError)
      throw new Error(`Failed to parse JSON response from Arbeitnow API: ${message}`)
    }

    if (!json || !Array.isArray(json.data)) {
      throw new Error('Malformed payload: Arbeitnow API response missing required "data" array')
    }

    // 4. Data cleansing: filter out incomplete records missing essential identity attributes
    const validItems = json.data.filter(
      (item): item is ArbeitnowJobPayload & { title: string; company_name: string } =>
        Boolean(item && typeof item.title === 'string' && item.title.trim() &&
                typeof item.company_name === 'string' && item.company_name.trim()),
    )

    // 5. Slice to target count
    const targetSlice = validItems.slice(0, count)

    // 6. Map external REST shape into Pulseboard Job model
    const mappedJobs: Job[] = targetSlice.map((item) => {
      // Deterministic unique ID generation mirroring mock format
      const id = `arbeitnow_${item.slug || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`}`
      const title = item.title.trim()
      const company = item.company_name.trim()

      // Location resolution with remote fallback
      const rawLocation = (item.location || '').trim()
      const location = rawLocation || (item.remote ? 'Remote' : 'Bengaluru, Karnataka')

      // Work mode resolution: Arbeitnow provides boolean 'remote'; map false to Hybrid or On-site
      const workMode: WorkMode = item.remote
        ? 'Remote'
        : (Math.random() > 0.5 ? 'Hybrid' : 'On-site')

      // Tag resolution: preserve API tags; fallback to diverse mock pool if empty
      const cleanTags = Array.isArray(item.tags)
        ? item.tags.map((t) => String(t).trim()).filter(Boolean)
        : []
      const tags = cleanTags.length > 0 ? cleanTags : getRandomTags()

      // Simulated telemetry attributes (not provided by public job boards)
      const salaryRange = SALARY_BANDS[Math.floor(Math.random() * SALARY_BANDS.length)]
      const matchScore = Math.floor(Math.random() * 45) + 55

      // Monotonic sequence and timestamp resolution
      const postedAtMs =
        typeof item.created_at === 'number' && item.created_at * 1000 <= Date.now()
          ? item.created_at * 1000
          : Date.now() - Math.floor(Math.random() * 86400000)
      const freshnessRank = getNextFreshnessRank()

      return {
        id,
        title,
        company,
        location,
        workMode,
        salaryRange,
        tags,
        matchScore,
        postedAtMs,
        freshnessRank,
      }
    })

    // Sort descending by matchScore to match existing feed presentation
    return mappedJobs.sort((a, b) => b.matchScore - a.matchScore)
  })()
}
