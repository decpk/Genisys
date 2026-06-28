import type { ClipboardGet, ClipboardSet } from '../clipboard-store.types'

export async function removeItemAction(get: ClipboardGet, set: ClipboardSet, id: string): Promise<void> {
  try {
    await window.api.removeClipboardItem(id)
    set({ items: get().items.filter((i) => i.id !== id) })
    get().loadStats()
  } catch (e) {
    console.error('[clipboard] removeItem failed:', e)
  }
}
