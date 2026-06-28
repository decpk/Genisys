import type { NotesSplitState } from '../notes-app-store.types'

/** Narrows an unknown (persisted) value to a structurally valid split state. */
export function isValidSplitState(value: unknown): value is NotesSplitState {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Partial<NotesSplitState>
  if (!Array.isArray(v.panes) || v.panes.length !== 2) return false
  const panesOk = v.panes.every(
    (p) =>
      p &&
      typeof p.noteId === 'string' &&
      (p.mode === 'edit' || p.mode === 'view') &&
      typeof p.contentWidth === 'string',
  )
  if (!panesOk) return false
  if (v.orientation !== 'side-by-side' && v.orientation !== 'stacked') return false
  if (typeof v.ratio !== 'number') return false
  if (v.activeIndex !== 0 && v.activeIndex !== 1) return false
  return true
}
