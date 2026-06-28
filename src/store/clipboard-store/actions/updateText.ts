import type { ClipboardGet, ClipboardSet } from '../clipboard-store.types'

export async function updateTextAction(get: ClipboardGet, set: ClipboardSet, id: string, textContent: string): Promise<void> {
  try {
    await window.api.updateClipboardText(id, textContent)
    set({
      items: get().items.map((i) =>
        i.id === id ? { ...i, textContent } : i
      ),
    })
  } catch (e) {
    console.error('[clipboard] updateText failed:', e)
  }
}
