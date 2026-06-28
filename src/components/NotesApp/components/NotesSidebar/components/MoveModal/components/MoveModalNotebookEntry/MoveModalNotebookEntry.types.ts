import type { NoteNotebook } from '@/store/note-notebooks-store'
import type { NoteSection } from '@/store/note-sections-store'
import type { NoteTopic } from '@/store/note-topics-store'

export interface MoveModalNotebookEntryProps {
  notebook: NoteNotebook
  notebookSections: NoteSection[]
  topics: NoteTopic[]
  projectSuffix: string | null
  isMovingNote: boolean
  isMovingTopic: boolean
  isNotebookExpanded: boolean
  isNotebookSelected: boolean
  selectedSectionId: string | null
  selectedTopicId: string | null
  expandedSections: Set<string>
  onToggleNotebook: (notebookId: string) => void
  onToggleSection: (sectionId: string) => void
  onSelectNotebook: (notebookId: string) => void
  onSelectSection: (notebookId: string | null, sectionId: string) => void
  onSelectTopic: (notebookId: string, sectionId: string, topicId: string) => void
}
