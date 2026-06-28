import type { ClipboardLabel, ClipboardLabelState } from '../clipboard-label-store.types'

export async function createLabelAction(
  get: () => ClipboardLabelState,
  set: (partial: Partial<ClipboardLabelState>) => void,
  name: string,
  color: string
): Promise<ClipboardLabel> {
  const label: ClipboardLabel = {
    id: crypto.randomUUID(),
    name,
    color,
    createdAt: new Date().toISOString(),
  }

  set({ labels: [...get().labels, label] })
  await window.api.createClipboardLabel(label.id, name, color)
  return label
}
