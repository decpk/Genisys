import type { ClipboardGet, ClipboardSet, ClipboardItem } from '../clipboard-store.types'

export async function loadItemsAction(get: ClipboardGet, set: ClipboardSet, reset = false): Promise<void> {
  const { isLoading, cursor, offset, filter, searchQuery, isFuzzySearch, items } = get()
  if (isLoading) return

  set({ isLoading: true })

  try {
    const isSmartFilter = filter.startsWith('smart:')
    const isSensitiveFilter = filter === 'sensitive'
    const isClientFilter = isSmartFilter || isSensitiveFilter
    const contentType = (filter === 'all' || isClientFilter) ? undefined : filter
    const result = await window.api.loadClipboardItems({
      cursor: isFuzzySearch ? undefined : (reset ? undefined : cursor ?? undefined),
      limit: isClientFilter ? 200 : 50,
      contentType,
      search: searchQuery || undefined,
      fuzzy: isFuzzySearch || undefined,
      offset: isFuzzySearch ? (reset ? 0 : offset) : undefined,
    })

    const newItems = result.items as ClipboardItem[]
    const lastItem = newItems[newItems.length - 1]

    set({
      items: reset ? newItems : [...items, ...newItems],
      hasMore: result.hasMore,
      cursor: isFuzzySearch ? null : (lastItem?.createdAt ?? null),
      offset: isFuzzySearch ? (reset ? newItems.length : offset + newItems.length) : 0,
      isLoading: false,
      isLoaded: true,
    })
  } catch (e) {
    console.error('[clipboard] loadItems failed:', e)
    set({ isLoading: false })
  }
}
