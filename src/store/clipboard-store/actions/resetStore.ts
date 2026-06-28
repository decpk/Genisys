import type { ClipboardSet } from '../clipboard-store.types'
import { CLIPBOARD_INITIAL_STATE } from '../clipboard-store.constants'

export function resetStoreAction(set: ClipboardSet): void {
  set(CLIPBOARD_INITIAL_STATE)
}
