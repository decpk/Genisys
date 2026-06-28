import type { ClipboardLabelState } from '../clipboard-label-store.types'

export async function updateLabelAction(
  get: () => ClipboardLabelState,
  set: (partial: Partial<ClipboardLabelState>) => void,
  id: string,
  name: string,
  color: string
): Promise<void> {
  set({
    labels: get().labels.map((l) =>
      l.id === id ? { ...l, name, color } : l
    ),
  })
  await window.api.updateClipboardLabel(id, name, color)
}
