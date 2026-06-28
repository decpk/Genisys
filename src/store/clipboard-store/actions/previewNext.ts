import type { ClipboardGet, ClipboardSet } from '../clipboard-store.types'
import { getFilteredItems } from '@/components/ClipboardManager/utils/getFilteredItems'

export function previewNextAction(get: ClipboardGet, set: ClipboardSet): void {
  const { previewItemId, items, filter } = get()
  if (previewItemId === null) return
  const filtered = getFilteredItems(items, filter)
  const currentIndex = filtered.findIndex((i) => i.id === previewItemId)
  if (currentIndex === -1 || currentIndex >= filtered.length - 1) return
  set({ previewItemId: filtered[currentIndex + 1].id })
}
