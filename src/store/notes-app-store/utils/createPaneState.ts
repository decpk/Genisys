import { useSettingsStore } from '@/store/settings-store'

import type { NotesPaneState } from '../notes-app-store.types'

/**
 * Builds a pane state for a note, seeding its mode and content width from the
 * current global Notes settings so a freshly opened split matches the single
 * pane the user was just looking at.
 */
export function createPaneState(noteId: string): NotesPaneState {
  const settings = useSettingsStore.getState()
  return {
    noteId,
    mode: settings.notesMode,
    contentWidth: settings.notesContentWidth,
  }
}
