import type { ClipboardGet, ClipboardSet } from '../clipboard-store.types'

export function setSearchQueryAction(get: ClipboardGet, set: ClipboardSet, query: string): void {
  set({ searchQuery: query, cursor: null, offset: 0, hasMore: true })
  get().loadItems(true)
}
