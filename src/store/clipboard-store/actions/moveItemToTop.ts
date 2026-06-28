import type { ClipboardGet, ClipboardSet, ClipboardItem } from '../clipboard-store.types'

export function moveItemToTopAction(get: ClipboardGet, set: ClipboardSet, item: ClipboardItem): void {
  const { items, filter } = get()
  if (filter === 'text' && item.contentType !== 'text') return
  if (filter === 'image' && item.contentType !== 'image') return
  if (filter === 'labeled' || filter.startsWith('label:')) return
  const filtered = items.filter((i) => i.contentHash !== item.contentHash)
  if (filtered.length === items.length) return
  set({
    items: [item, ...filtered],
  })
}
