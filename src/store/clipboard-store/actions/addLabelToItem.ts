import type { ClipboardGet, ClipboardSet } from '../clipboard-store.types'
import type { ClipboardLabel } from '@/store/clipboard-label-store'

export function addLabelToItemAction(get: ClipboardGet, set: ClipboardSet, itemId: string, label: ClipboardLabel): void {
  const { items, stats } = get()
  const target = items.find((i) => i.id === itemId)
  const wasUnlabeled = target ? target.labels.length === 0 : false
  set({
    items: items.map((i) =>
      i.id === itemId ? { ...i, labels: [...i.labels, label] } : i
    ),
    stats: wasUnlabeled
      ? { ...stats, labeledCount: stats.labeledCount + 1 }
      : stats,
  })
}
