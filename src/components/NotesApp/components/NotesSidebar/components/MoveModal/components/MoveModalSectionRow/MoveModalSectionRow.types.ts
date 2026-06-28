import type { NoteSection } from '@/store/note-sections-store'
import type { NoteTopic } from '@/store/note-topics-store'

export interface MoveModalSectionRowProps {
  section: NoteSection
  topics: NoteTopic[]
  isExpanded: boolean
  isSelected: boolean
  selectedTopicId: string | null
  showTopics: boolean
  onToggle: () => void
  onSelect: () => void
  onSelectTopic: (topicId: string) => void
}
