import type { NotesShareKind } from './api'

/** What the user is sharing — drives the device picker's send action. */
export type ShareTarget =
  | { type: 'book'; bookId: string; label: string }
  | { type: 'notes'; kind: NotesShareKind; id?: string; label: string }
