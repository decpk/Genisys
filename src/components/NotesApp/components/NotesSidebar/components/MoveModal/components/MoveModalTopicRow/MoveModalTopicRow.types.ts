import type { NoteTopic } from '@/store/note-topics-store'

export interface MoveModalTopicRowProps {
  topic: NoteTopic
  isSelected: boolean
  onSelect: () => void
}
