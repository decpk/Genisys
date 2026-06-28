import { persistNotesAppState } from '../persistence/persistNotesAppState'
import { clampSplitRatio } from '../utils/clampSplitRatio'
import type { NotesAppGet, NotesAppSet } from './action-context.types'

/** Moves the split divider; the ratio is clamped to the allowed range. */
export function setSplitRatioAction(
  get: NotesAppGet,
  set: NotesAppSet,
  ratio: number,
): void {
  const state = get()
  if (!state.splitState) return
  set({ splitState: { ...state.splitState, ratio: clampSplitRatio(ratio) } })
  persistNotesAppState(get)
}
