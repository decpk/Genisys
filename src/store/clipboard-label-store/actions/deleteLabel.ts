import type { ClipboardLabelState } from '../clipboard-label-store.types'

export async function deleteLabelAction(
  get: () => ClipboardLabelState,
  set: (partial: Partial<ClipboardLabelState>) => void,
  id: string
): Promise<{ success: boolean; affectedCount: number }> {
  const result = await window.api.deleteClipboardLabel(id)
  if (result.success) {
    set({ labels: get().labels.filter((l) => l.id !== id) })
  }
  return result
}
