import type { RequestStatus, ApiRequestEntry } from '@/store/debug-store'

export interface UseDebugPanelReturn {
  requests: ApiRequestEntry[]
  filteredRequests: ApiRequestEntry[]
  selectedRequest: ApiRequestEntry | null
  statusFilter: RequestStatus | 'all'
  searchQuery: string
  selectedId: string | null
  isIntercepting: boolean
  stats: DebugStats
  setStatusFilter: (filter: RequestStatus | 'all') => void
  setSearchQuery: (query: string) => void
  selectRequest: (id: string) => void
  navigateRequest: (direction: 'up' | 'down') => void
  handleClear: () => void
  handleOpenInNewWindow: () => void
  toggleIntercepting: () => void
}

export interface DebugStats {
  total: number
  pending: number
  success: number
  error: number
  avgDuration: number
}
