import type { ModalState } from '../../useNotesSidebarModalsData'

interface MoveSelection {
  notebookId: string | null
  sectionId: string | null
  topicId: string | null
}

export function isMoveSelectionValid(
  selection: MoveSelection,
  modalType: ModalState['type'],
): boolean {
  if (modalType === 'move-section') return selection.notebookId !== null
  if (modalType === 'move-topic') return selection.sectionId !== null
  return selection.notebookId !== null || selection.sectionId !== null || selection.topicId !== null
}
