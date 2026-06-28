import type { NotesAppStore } from '../../notes-app-store'

/** Reads the full Notes-app store state. */
export type NotesAppGet = () => NotesAppStore

/** Patches the Notes-app store state. */
export type NotesAppSet = (
  partial:
    | Partial<NotesAppStore>
    | ((state: NotesAppStore) => Partial<NotesAppStore>),
) => void
