import type { Job, WorkMode } from '../types/job'

export const JOB_TITLES: string[] = [
  // Frontend
  'Senior Frontend Engineer',
  'Staff UI Platform Architect',
  'Lead Design Systems Engineer',
  'Real-Time Dashboard Specialist',
  'Senior React / TypeScript Developer',
  'Web Performance Optimization Engineer',
  'Frontend Core Infrastructure Engineer',
  'UI/UX Systems Technologist',
  'Senior Web Platform Architect',

  // Full Stack
  'Full Stack React & Node Engineer',
  'Senior Full Stack Engineer (Python & React)',
  'Full Stack AI Applications Engineer',

  // Backend
  'Senior Go Backend Platform Engineer',
  'Staff Backend Distributed Systems Engineer',
  'Lead Java Microservices Architect',
  'Senior Node.js / TypeScript Backend Developer',
  'Backend Database & Storage Engineer',
  'Senior C# / .NET Cloud Services Engineer',

  // DevOps & Cloud Infrastructure
  'Senior DevOps & Cloud Infrastructure Engineer',
  'Site Reliability & Kubernetes Platform Specialist',
  'Cloud Platform Engineer (AWS & Terraform)',

  // Data & Machine Learning
  'Senior Data Platform & Pipeline Engineer',
  'Machine Learning Systems Engineer',
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
  // Frontend
  'React',
  'TypeScript',
  'Next.js',
  'Tailwind CSS',
  'GraphQL',
  'WebSockets',
  'Design Systems',
  'Micro-frontends',
  'Core Web Vitals',
  'State Machines',
  'WebAssembly',
  'Performance Optimization',

  // Backend & Languages
  'Node.js',
  'Python',
  'Go',
  'Java',
  'C#',
  '.NET',
  'REST APIs',
  'gRPC',

  // Databases & Caching
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'SQL',

  // DevOps, Cloud & Tooling
  'Docker',
  'Kubernetes',
  'AWS',
  'CI/CD',
  'Git',
  'Terraform',
  'Kafka',

  // Data & Machine Learning
  'Machine Learning',
  'PyTorch',
  'Data Pipelines',
  'Elasticsearch',
]

export const TAG_POOL = SKILL_TAGS

const DOMAIN_TAGS: Record<string, string[]> = {
  frontend: [
    'React',
    'TypeScript',
    'Next.js',
    'Tailwind CSS',
    'GraphQL',
    'WebSockets',
    'Design Systems',
    'Micro-frontends',
    'Core Web Vitals',
    'State Machines',
    'Performance Optimization',
  ],
  fullstack: [
    'React',
    'TypeScript',
    'Next.js',
    'Node.js',
    'Python',
    'PostgreSQL',
    'MongoDB',
    'REST APIs',
    'GraphQL',
    'Docker',
    'AWS',
    'Git',
  ],
  backend: [
    'Go',
    'Python',
    'Java',
    'Node.js',
    'C#',
    '.NET',
    'PostgreSQL',
    'Redis',
    'SQL',
    'REST APIs',
    'gRPC',
    'Kafka',
    'Docker',
  ],
  devops: [
    'Kubernetes',
    'Docker',
    'AWS',
    'CI/CD',
    'Terraform',
    'Git',
    'Go',
    'Python',
    'Redis',
  ],
  data_ai: [
    'Python',
    'Machine Learning',
    'PyTorch',
    'Data Pipelines',
    'SQL',
    'PostgreSQL',
    'Kafka',
    'Elasticsearch',
    'Docker',
  ],
}

// Monotonically increasing rank counter for job freshness
let currentFreshnessRank = 0

/**
 * Returns a random element from an array.
 */
function getRandomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Returns a randomized subset of tags (3 to 5 tags) from a pool.
 */
export function getRandomTags(pool: readonly string[] = SKILL_TAGS): string[] {
  const shuffled = [...pool].sort(() => 0.5 - Math.random())
  const count = Math.floor(Math.random() * 3) + 3 // 3, 4, or 5 tags
  return shuffled.slice(0, count)
}

/**
 * Generates contextually paired tags for a job title with cross-domain variety.
 */
function getTagsForJob(title: string): string[] {
  let primaryPool: string[]
  const lower = title.toLowerCase()

  if (
    lower.includes('devops') ||
    lower.includes('reliability') ||
    lower.includes('kubernetes') ||
    lower.includes('cloud platform')
  ) {
    primaryPool = DOMAIN_TAGS.devops
  } else if (
    lower.includes('data') ||
    lower.includes('machine learning') ||
    lower.includes('ai')
  ) {
    primaryPool = DOMAIN_TAGS.data_ai
  } else if (
    lower.includes('backend') ||
    lower.includes('go') ||
    lower.includes('java') ||
    lower.includes('.net') ||
    lower.includes('database')
  ) {
    primaryPool = DOMAIN_TAGS.backend
  } else if (lower.includes('full stack')) {
    primaryPool = DOMAIN_TAGS.fullstack
  } else {
    primaryPool = DOMAIN_TAGS.frontend
  }

  // Shuffle primary pool and pick 2-3 tags
  const shuffledPrimary = [...primaryPool].sort(() => 0.5 - Math.random())
  const primaryCount = Math.floor(Math.random() * 2) + 2 // 2 or 3 tags
  const selectedPrimary = shuffledPrimary.slice(0, primaryCount)

  // Shuffle global pool and pick 1-2 tags to provide cross-domain variety
  const shuffledGlobal = [...SKILL_TAGS].sort(() => 0.5 - Math.random())
  const globalCount = Math.floor(Math.random() * 2) + 1 // 1 or 2 tags
  const selectedGlobal = shuffledGlobal.slice(0, globalCount)

  // Combine and deduplicate
  const combined = Array.from(new Set([...selectedPrimary, ...selectedGlobal]))
  // Ensure between 3 and 5 tags
  const targetCount = Math.min(5, Math.max(3, combined.length))
  return combined.slice(0, targetCount)
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
  const tags = getTagsForJob(title)
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
