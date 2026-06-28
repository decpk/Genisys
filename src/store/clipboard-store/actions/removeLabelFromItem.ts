import type { ClipboardGet, ClipboardSet } from '../clipboard-store.types'

export function removeLabelFromItemAction(get: ClipboardGet, set: ClipboardSet, itemId: string, labelId: string): void {
  set({
    items: get().items.map((i) =>
      i.id === itemId ? { ...i, labels: i.labels.filter((l) => l.id !== labelId) } : i
    ),
  })
}
