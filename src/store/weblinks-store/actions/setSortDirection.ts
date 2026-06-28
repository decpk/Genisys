import type {
  PreviewSortDirection,
  WebLinksStoreState,
} from '@/components/WebLinks/WebLinks.types'

/** Set the active sort direction for the collection grid. */
export function setSortDirectionAction(
  set: (partial: Partial<WebLinksStoreState>) => void,
  direction: PreviewSortDirection,
): void {
  set({ sortDirection: direction })
}
