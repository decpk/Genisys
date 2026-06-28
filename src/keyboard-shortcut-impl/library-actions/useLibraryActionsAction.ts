import { useBindShortcutActions } from '@/frameworks/keyboard-shortcut'
import { useLibraryStore } from '@/store/library-store'
import { useNotesAppStore } from '@/store/notes-app-store'
import { useSettingsStore } from '@/store/settings-store'
import { triggerEditorToggle } from '@/store/panel-toggle-registry'

function toggleRead(): void {
  const { activeBook, activeChapterId, toggleChapterRead } = useLibraryStore.getState()
  if (!activeChapterId || !activeBook) return
  const chapter = activeBook.chapters.find((c) => c.id === activeChapterId)
  if (!chapter) return
  toggleChapterRead(chapter.id, !chapter.isRead)
}

function toggleDistractionFree(): void {
  useLibraryStore.getState().toggleDistractionFree()
}

function editChapter(): void {
  const { activeBook, activeChapterId } = useLibraryStore.getState()
  if (!activeChapterId || !activeBook) return
  const chapter = activeBook.chapters.find((c) => c.id === activeChapterId)
  if (!chapter || chapter.status !== 'completed') return
  triggerEditorToggle()
}

export function useLibraryActionsAction(): void {
  useBindShortcutActions({
    'library.toggleRead': toggleRead,
    'library.toggleDistractionFree': toggleDistractionFree,
    'library.editChapter': editChapter,
  })
}

export function useNotesActionsAction(): void {
  useBindShortcutActions({
    'notes.toggleFullScreen': () => useNotesAppStore.getState().toggleDistractionFree(),
    'notes.toggleLabels': () => {
      const s = useSettingsStore.getState()
      s.setNotesShowLabels(!s.notesShowLabels)
    },
  })
}
