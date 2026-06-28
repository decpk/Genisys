import type { SessionGroup } from '../../utils/groupSessionsByDate'

export interface HistorySessionGroupProps {
  group: SessionGroup
  onDelete: (id: string) => void
}
