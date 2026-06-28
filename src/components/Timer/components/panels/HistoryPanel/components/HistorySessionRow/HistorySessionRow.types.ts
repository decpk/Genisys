import type { TimerSession } from '@/store/timer-store/timer-store.types'

export interface HistorySessionRowProps {
  session: TimerSession
  onDelete: (id: string) => void
}
