import type { Job, WorkMode } from '../types/job'

export const JOB_TITLES: string[] = [
  'Senior Frontend Engineer',
  'Staff UI Platform Architect',
  'Lead Design Systems Engineer',
  'Real-Time Dashboard Specialist',
  'Senior React / TypeScript Developer',
  'Web Performance Optimization Engineer',
  'Frontend Core Infrastructure Engineer',
  'UI/UX Systems Technologist',
  'Full Stack React & Node Engineer',
  'Senior Web Platform Architect',
]

export const COMPANIES: string[] = [
  'HyperPulse Dynamics',
  'Kinesis Labs',
  'Synapse Metrics',
  'ChronoScale AI',
  'Veloce Technologies',
  'ApexStream',
  'QuantVibe Systems',
  'SpectraCloud',
  'LuminaCore Data',
  'AetherWorks',
  'Novus Dynamics',
  'OrbitAI Systems',
]

export const LOCATIONS: string[] = [
  'Bengaluru, Karnataka',
  'Hyderabad, Telangana',
  'Pune, Maharashtra',
  'Gurgaon, Haryana',
  'Noida, Uttar Pradesh',
  'Chennai, Tamil Nadu',
]

export const WORK_MODES: WorkMode[] = ['Remote', 'Hybrid', 'On-site']

export const SALARY_BANDS: string[] = [
  '₹18 - ₹25 LPA',
  '₹26 - ₹36 LPA',
  '₹38 - ₹50 LPA',
  '₹52 - ₹68 LPA',
  '₹70 - ₹95 LPA',
]

export const SKILL_TAGS: string[] = [
  'React',
  'TypeScript',
  'Next.js',
  'WebSockets',
  'Design Systems',
  'Core Web Vitals',
  'Tailwind CSS',
  'State Machines',
  'GraphQL',
  'Micro-frontends',
  'Performance Optimization',
  'WebAssembly',
]

// Monotonically increasing rank counter for job freshness
let currentFreshnessRank = 0

/**
 * Returns a random element from an array.
 */
function getRandomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Returns a randomized subset of tags (3 to 5 tags).
 */
function getRandomTags(pool: readonly string[]): string[] {
  const shuffled = [...pool].sort(() => 0.5 - Math.random())
  const count = Math.floor(Math.random() * 3) + 3 // 3, 4, or 5 tags
  return shuffled.slice(0, count)
}

/**
 * Generates a single realistic fake job using the value pools.
 */
export function generateJob(): Job {
  currentFreshnessRank += 1
  const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const title = getRandomItem(JOB_TITLES)
  const company = getRandomItem(COMPANIES)
  const location = getRandomItem(LOCATIONS)
  const workMode = getRandomItem(WORK_MODES)
  const salaryRange = getRandomItem(SALARY_BANDS)
  const tags = getRandomTags(SKILL_TAGS)
  // Randomized match score between 55 and 99 (simulating semantic similarity output)
  const matchScore = Math.floor(Math.random() * 45) + 55

  return {
    id,
    title,
    company,
    location,
    workMode,
    salaryRange,
    tags,
    matchScore,
    postedAtMs: Date.now(),
    freshnessRank: currentFreshnessRank,
  }
}

/**
 * Generates an initial batch of count jobs, sorted by matchScore descending.
 */
export function generateInitialBatch(count: number): Job[] {
  const jobs: Job[] = []
  for (let i = 0; i < count; i++) {
    jobs.push(generateJob())
  }

  // Return sorted by matchScore descending
  return jobs.sort((a, b) => b.matchScore - a.matchScore)
}
