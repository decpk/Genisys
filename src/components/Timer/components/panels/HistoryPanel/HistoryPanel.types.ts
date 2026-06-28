import type { TimerSession } from '@/store/timer-store/timer-store.types'

export interface HistoryFilter {
  search: string
  tagId: string | null
  fromTs: number | null
  toTs: number | null
}

export interface HistoryPagination {
  limit: number
  offset: number
}

export interface HistoryLoadResult {
  items: TimerSession[]
  hasMore: boolean
}

export interface HistoryPanelProps {}
