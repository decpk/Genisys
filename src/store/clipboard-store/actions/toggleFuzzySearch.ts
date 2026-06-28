import type { ClipboardGet, ClipboardSet } from '../clipboard-store.types'

export function toggleFuzzySearchAction(get: ClipboardGet, set: ClipboardSet): void {
  const { isFuzzySearch } = get()
  set({ isFuzzySearch: !isFuzzySearch, cursor: null, offset: 0, hasMore: true })
  get().loadItems(true)
}
