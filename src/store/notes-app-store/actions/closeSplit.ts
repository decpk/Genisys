import { useSettingsStore } from '@/store/settings-store'

import { persistNotesAppState } from '../persistence/persistNotesAppState'
import type { NotesPaneIndex } from '../notes-app-store.types'
import type { NotesAppGet, NotesAppSet } from './action-context.types'

/**
 * Collapses a split back to a single pane, keeping the note at `keepIndex` and
 * restoring the global Notes mode/width from that pane so the single view is
 * visually consistent with what the user was editing.
 */
export function closeSplitAction(
  get: NotesAppGet,
  set: NotesAppSet,
  keepIndex: NotesPaneIndex,
): void {
  const state = get()
  if (!state.splitState) return

  const kept = state.splitState.panes[keepIndex]
  set({ splitState: null, selectedNoteId: kept.noteId })

  const settings = useSettingsStore.getState()
  settings.setNotesMode(kept.mode)
  settings.setNotesContentWidth(kept.contentWidth)

  persistNotesAppState(get)
}
