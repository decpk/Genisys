import type { ClipboardGet, ClipboardSet, FilterType } from '../clipboard-store.types'

export function setFilterAction(get: ClipboardGet, set: ClipboardSet, filter: FilterType): void {
  set({ filter, cursor: null, offset: 0, hasMore: true })
  get().loadItems(true)
}
