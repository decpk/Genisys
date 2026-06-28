import type { NoteSection } from '@/store/note-sections-store'
import type { ModalState } from '../../useNotesSidebarModalsData'

export function filterDestinationSections(
  sections: NoteSection[],
  notebookId: string,
  modalState: ModalState,
): NoteSection[] {
  const inNotebook = sections.filter((s) => s.notebookId === notebookId)
  if (modalState.type !== 'move-topic') return inNotebook
  const originSectionId = modalState.node?.sectionId
  if (!originSectionId) return inNotebook
  return inNotebook.filter((s) => s.id !== originSectionId)
}
