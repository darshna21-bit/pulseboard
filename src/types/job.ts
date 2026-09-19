export type WorkMode = 'Remote' | 'Hybrid' | 'On-site'

export type ConnectionState = 'connecting' | 'live' | 'reconnecting' | 'offline'

export interface Job {
  id: string
  title: string
  company: string
  location: string
  workMode: WorkMode
  salaryRange: string
  tags: string[]
  matchScore: number // 0-100
  postedAtMs: number
  freshnessRank: number
}
