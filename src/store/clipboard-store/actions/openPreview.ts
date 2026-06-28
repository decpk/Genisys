import type { ClipboardSet } from '../clipboard-store.types'

export function openPreviewAction(set: ClipboardSet, id: string): void {
  set({ previewItemId: id })
}
