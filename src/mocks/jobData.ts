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

  // Backend & API
  'Senior Backend API Engineer (Node.js & Express)',
  'Python & Flask Backend Developer',
  'Senior Go Backend Platform Engineer',
  'Staff Backend Distributed Systems Engineer',
  'Lead Java Microservices Architect',
  'Systems & High-Performance C++ Engineer',
  'Senior C# / .NET Cloud Services Engineer',
  'Backend Database & Storage Engineer',

  // DevOps & Cloud Infrastructure
  'Senior DevOps & Cloud Infrastructure Engineer',
  'Site Reliability & Kubernetes Platform Specialist',
  'Cloud Platform Engineer (AWS & Terraform)',
  'Infrastructure & Nginx Gateway Specialist',

  // Data & AI / ML
  'Senior Data Platform & Pipeline Engineer',
  'Machine Learning & PyTorch Systems Engineer',

  // QA & Testing
  'QA & Test Automation Engineer (Jest & Pytest)',
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
  // Languages
  'TypeScript',
  'JavaScript',
  'Python',
  'C++',
  'Go',
  'Java',
  'C#',
  '.NET',
  'SQL',

  // Frontend
  'React',
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

  // Backend & Frameworks
  'Node.js',
  'Express.js',
  'Flask',
  'RESTful API Design',
  'Microservices',
  'gRPC',

  // Databases & Caching
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',

  // Cloud & Infrastructure
  'AWS',
  'Docker',
  'Kubernetes',
  'Nginx',
  'Git',
  'CI/CD',
  'Terraform',
  'Kafka',

  // AI & Machine Learning
  'PyTorch',
  'Machine Learning',
  'Data Pipelines',
  'Elasticsearch',

  // Testing & Quality
  'Jest',
  'Pytest',
]

export const TAG_POOL = SKILL_TAGS

const DOMAIN_TAGS: Record<string, string[]> = {
  frontend: [
    'React',
    'TypeScript',
    'JavaScript',
    'Next.js',
    'Tailwind CSS',
    'GraphQL',
    'WebSockets',
    'Design Systems',
    'Micro-frontends',
    'Core Web Vitals',
    'Jest',
    'Performance Optimization',
  ],
  fullstack: [
    'React',
    'TypeScript',
    'JavaScript',
    'Next.js',
    'Node.js',
    'Express.js',
    'Python',
    'PostgreSQL',
    'MongoDB',
    'RESTful API Design',
    'GraphQL',
    'Docker',
    'AWS',
    'Git',
    'Jest',
  ],
  backend_api: [
    'Node.js',
    'Express.js',
    'Python',
    'Flask',
    'PostgreSQL',
    'MySQL',
    'MongoDB',
    'Redis',
    'SQL',
    'RESTful API Design',
    'Microservices',
    'Docker',
    'Jest',
    'Pytest',
  ],
  backend_systems: [
    'Go',
    'Java',
    'C++',
    'C#',
    '.NET',
    'gRPC',
    'Kafka',
    'PostgreSQL',
    'Redis',
    'SQL',
    'Microservices',
    'RESTful API Design',
    'Docker',
    'WebAssembly',
    'Performance Optimization',
  ],
  devops: [
    'Kubernetes',
    'Docker',
    'AWS',
    'Nginx',
    'CI/CD',
    'Terraform',
    'Git',
    'Microservices',
    'Go',
    'Python',
    'Redis',
  ],
  data_ai: [
    'Python',
    'PyTorch',
    'Machine Learning',
    'Data Pipelines',
    'SQL',
    'PostgreSQL',
    'MySQL',
    'Kafka',
    'Elasticsearch',
    'Docker',
    'Pytest',
  ],
  qa_testing: [
    'Jest',
    'Pytest',
    'TypeScript',
    'JavaScript',
    'Python',
    'CI/CD',
    'Git',
    'Docker',
    'RESTful API Design',
  ],
}

// Monotonically increasing rank counter for job freshness
let currentFreshnessRank = 0

export function getNextFreshnessRank(): number {
  currentFreshnessRank += 1
  return currentFreshnessRank
}

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
export function getTagsForJob(title: string): string[] {
  let primaryPool: string[]
  const lower = title.toLowerCase()

  if (lower.includes('qa') || lower.includes('test')) {
    primaryPool = DOMAIN_TAGS.qa_testing
  } else if (
    lower.includes('devops') ||
    lower.includes('reliability') ||
    lower.includes('kubernetes') ||
    lower.includes('cloud') ||
    lower.includes('nginx')
  ) {
    primaryPool = DOMAIN_TAGS.devops
  } else if (
    lower.includes('data') ||
    lower.includes('machine learning') ||
    lower.includes('pytorch') ||
    lower.includes('ai')
  ) {
    primaryPool = DOMAIN_TAGS.data_ai
  } else if (
    lower.includes('express') ||
    lower.includes('flask') ||
    lower.includes('api')
  ) {
    primaryPool = DOMAIN_TAGS.backend_api
  } else if (
    lower.includes('backend') ||
    lower.includes('go') ||
    lower.includes('java') ||
    lower.includes('c++') ||
    lower.includes('.net') ||
    lower.includes('database')
  ) {
    primaryPool = DOMAIN_TAGS.backend_systems
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
export function generateJob(forcedTitle?: string, forcedTags?: string[]): Job {
  currentFreshnessRank += 1
  const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const title = forcedTitle || getRandomItem(JOB_TITLES)
  const company = getRandomItem(COMPANIES)
  const location = getRandomItem(LOCATIONS)
  const workMode = getRandomItem(WORK_MODES)
  const salaryRange = getRandomItem(SALARY_BANDS)
  const tags = forcedTags || getTagsForJob(title)
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
 * Seeds diverse initial roles to ensure full coverage across all requested technologies.
 */
export function generateInitialBatch(count: number): Job[] {
  const seedArchetypes: Array<{ title: string; tags: string[] }> = [
    {
      title: 'QA & Test Automation Engineer (Jest & Pytest)',
      tags: ['Jest', 'Pytest', 'JavaScript', 'CI/CD', 'Git'],
    },
    {
      title: 'Systems & High-Performance C++ Engineer',
      tags: ['C++', 'Docker', 'SQL', 'WebAssembly', 'Microservices'],
    },
    {
      title: 'Python & Flask Backend Developer',
      tags: ['Python', 'Flask', 'MySQL', 'Redis', 'Pytest'],
    },
    {
      title: 'Senior Backend API Engineer (Node.js & Express)',
      tags: ['Node.js', 'Express.js', 'MongoDB', 'RESTful API Design', 'Jest'],
    },
    {
      title: 'Site Reliability & Kubernetes Platform Specialist',
      tags: ['Kubernetes', 'Docker', 'Nginx', 'AWS', 'Git'],
    },
    {
      title: 'Machine Learning & PyTorch Systems Engineer',
      tags: ['Python', 'PyTorch', 'Machine Learning', 'Data Pipelines', 'Docker'],
    },
    {
      title: 'Senior React / TypeScript Developer',
      tags: ['React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'WebSockets'],
    },
    {
      title: 'Staff Backend Distributed Systems Engineer',
      tags: ['Go', 'PostgreSQL', 'Redis', 'Microservices', 'Kafka'],
    },
    {
      title: 'Cloud Platform Engineer (AWS & Terraform)',
      tags: ['AWS', 'Terraform', 'CI/CD', 'Kubernetes', 'Docker'],
    },
    {
      title: 'Full Stack React & Node Engineer',
      tags: ['React', 'Node.js', 'PostgreSQL', 'RESTful API Design', 'Docker'],
    },
  ]

  const jobs: Job[] = []

  // Add seeded archetypes up to count
  for (let i = 0; i < Math.min(count, seedArchetypes.length); i++) {
    const archetype = seedArchetypes[i]
    jobs.push(generateJob(archetype.title, archetype.tags))
  }

  // Fill remaining slots with dynamic randomized jobs
  while (jobs.length < count) {
    jobs.push(generateJob())
  }

  // Return sorted by matchScore descending
  return jobs.sort((a, b) => b.matchScore - a.matchScore)
}
