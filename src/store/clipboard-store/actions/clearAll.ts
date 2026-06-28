import type { ClipboardGet, ClipboardSet } from '../clipboard-store.types'

export async function clearAllAction(get: ClipboardGet, set: ClipboardSet): Promise<void> {
  try {
    await window.api.clearClipboardItems(true)
    set({ items: [], hasMore: false, cursor: null })
    get().loadStats()
  } catch (e) {
    console.error('[clipboard] clearAll failed:', e)
  }
}
