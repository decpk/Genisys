import type { ClipboardGet, ClipboardSet, ClipboardItem } from '../clipboard-store.types'

export function prependItemAction(get: ClipboardGet, set: ClipboardSet, item: ClipboardItem): void {
  const { items, filter, stats } = get()

  // Optimistically bump stats so sidebar counters update immediately even if
  // the follow-up loadStats() round trip is delayed or fails. The backend
  // remains the source of truth and will reconcile on the next loadStats().
  const alreadyTracked = items.some((i) => i.id === item.id)
  if (!alreadyTracked) {
    const labeledDelta = item.labels && item.labels.length > 0 ? 1 : 0
    set({
      stats: {
        ...stats,
        total: stats.total + 1,
        textCount: stats.textCount + (item.contentType === 'text' ? 1 : 0),
        imageCount: stats.imageCount + (item.contentType === 'image' ? 1 : 0),
        labeledCount: stats.labeledCount + labeledDelta,
        pinnedCount: stats.pinnedCount + (item.isPinned ? 1 : 0),
      },
    })
  }

  if (filter === 'text' && item.contentType !== 'text') return
  if (filter === 'image' && item.contentType !== 'image') return
  if (filter === 'labeled' || filter.startsWith('label:')) return
  if (filter.startsWith('smart:')) return
  if (filter === 'sensitive') return
  if (alreadyTracked) return
  set({
    items: [item, ...get().items],
  })
}
