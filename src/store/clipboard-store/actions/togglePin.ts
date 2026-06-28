import type { ClipboardGet, ClipboardSet } from '../clipboard-store.types'

export async function togglePinAction(
  get: ClipboardGet,
  set: ClipboardSet,
  id: string
): Promise<boolean> {
  try {
    const result = await window.api.toggleClipboardPin(id)
    if (!result.success) return get().items.find((i) => i.id === id)?.isPinned ?? false
    set({
      items: get().items.map((i) =>
        i.id === id ? { ...i, isPinned: result.isPinned } : i
      ),
    })
    void get().loadStats()
    return result.isPinned
  } catch (e) {
    console.error('[clipboard] togglePin failed:', e)
    return get().items.find((i) => i.id === id)?.isPinned ?? false
  }
}
