import type { ClipboardLabelState } from '../clipboard-label-store.types'

export async function loadLabelsAction(
  get: () => ClipboardLabelState,
  set: (partial: Partial<ClipboardLabelState>) => void
): Promise<void> {
  if (get().isLoaded) return
  try {
    const result = await window.api.loadClipboardLabels()
    set({ labels: result.labels, isLoaded: true })
  } catch {
    set({ labels: [], isLoaded: true })
  }
}
