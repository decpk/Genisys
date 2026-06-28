import type { AIRequestEntry, AIRequestStatus } from '@/store/ai-inspector-store'

export interface AIRequestRowProps {
  request: AIRequestEntry
  isSelected: boolean
  onSelect: (id: string) => void
}

export interface AIRequestDetailProps {
  request: AIRequestEntry
}

export interface AIStatusFilterOption {
  value: AIRequestStatus | 'all'
  label: string
}

export type AISortField = 'time' | 'duration' | 'channel'
export type AISortDirection = 'asc' | 'desc'

export interface AIInspectorStats {
  total: number
  pending: number
  streaming: number
  success: number
  error: number
  avgDuration: number
}
