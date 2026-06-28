import type { ClipboardGet, ClipboardSet } from '../clipboard-store.types'

export async function updateImageDescriptionAction(
  get: ClipboardGet,
  set: ClipboardSet,
  itemId: string,
  description: string
): Promise<void> {
  try {
    await window.api.updateClipboardImageDescription(itemId, description)
    set({
      items: get().items.map((i) =>
        i.id === itemId ? { ...i, imageDescription: description, analysisStatus: 'done' } : i
      ),
    })
  } catch (e) {
    console.error('[clipboard] updateImageDescription failed:', e)
  }
}
