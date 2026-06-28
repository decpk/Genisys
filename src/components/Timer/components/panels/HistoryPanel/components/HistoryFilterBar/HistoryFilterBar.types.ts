import type { TimerTag } from '@/store/timer-store/timer-store.types'

export interface HistoryFilterBarProps {
  search: string
  tagId: string | null
  tags: TimerTag[]
  onSearch: (value: string) => void
  onTagChange: (value: string | null) => void
  onReset: () => void
}
