export interface HeaderCheck {
  name: string
  displayName: string
  description: string
  value: string | null
  score: number
  maxScore: number
  details: string
}

export interface ScanResult {
  url: string
  status: number
  headers: HeaderCheck[]
  overallScore: number
  maxScore: number
  grade: string
  timestamp: number
}

export interface ScanResponse {
  success: boolean
  data?: ScanResult
  error?: string
}

export interface HistoryItem {
  url: string
  grade: string
  timestamp: number
}
