import type { ClipboardSet } from '../clipboard-store.types'

export function closePreviewAction(set: ClipboardSet): void {
  set({ previewItemId: null })
}
