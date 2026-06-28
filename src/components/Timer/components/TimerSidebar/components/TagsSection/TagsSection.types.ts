import type { TimerTag } from '@/store/timer-store/timer-store.types'

export interface TagsSectionProps {
  tags: TimerTag[]
  activeTagId: string | null
  onSelect: (id: string | null) => void
}
