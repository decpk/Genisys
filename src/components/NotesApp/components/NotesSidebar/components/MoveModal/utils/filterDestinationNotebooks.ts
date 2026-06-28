import type { NoteNotebook } from '@/store/note-notebooks-store'
import type { ModalState } from '../../useNotesSidebarModalsData'

export function filterDestinationNotebooks(
  notebooks: NoteNotebook[],
  modalState: ModalState,
): NoteNotebook[] {
  if (modalState.type !== 'move-section') return notebooks
  const originNotebookId = modalState.node?.notebookId
  if (!originNotebookId) return notebooks
  return notebooks.filter((nb) => nb.id !== originNotebookId)
}
