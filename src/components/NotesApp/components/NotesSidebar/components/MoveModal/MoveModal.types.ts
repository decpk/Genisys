import type { NoteNotebook } from '@/store/note-notebooks-store'
import type { NoteProject } from '@/store/note-projects-store'
import type { NoteSection } from '@/store/note-sections-store'
import type { NoteTopic } from '@/store/note-topics-store'

import type { ModalState } from '../useNotesSidebarModalsData'
import type { GroupedNotebooks } from './utils/groupNotebooksByProject'

export interface MoveModalProps {
  modalState: ModalState
  onClose: () => void
  onMove: (notebookId: string | null, sectionId: string | null, topicId: string | null) => void
  notebooks: NoteNotebook[]
  sections: NoteSection[]
  topics: NoteTopic[]
  projects: NoteProject[]
}

export interface MoveModalViewModel {
  modalState: ModalState
  sections: NoteSection[]
  topics: NoteTopic[]
  isMovingNote: boolean
  isMovingSection: boolean
  isMovingTopic: boolean
  selectedNotebookId: string | null
  selectedSectionId: string | null
  selectedTopicId: string | null
  expandedNotebooks: Set<string>
  expandedSections: Set<string>
  grouped: GroupedNotebooks
  hasSelection: boolean
  getSuffix: (notebook: NoteNotebook) => string | null
  toggleNotebook: (id: string) => void
  toggleSection: (id: string) => void
  handleSelect: (
    notebookId: string | null,
    sectionId: string | null,
    topicId: string | null,
  ) => void
  handleSave: () => void
}
