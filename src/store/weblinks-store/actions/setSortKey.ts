import type {
  PreviewSortKey,
  WebLinksStoreState,
} from '@/components/WebLinks/WebLinks.types'

/** Set the active sort field for the collection grid. */
export function setSortKeyAction(
  set: (partial: Partial<WebLinksStoreState>) => void,
  key: PreviewSortKey,
): void {
  set({ sortKey: key })
}
