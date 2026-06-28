import type { WebLinksStoreState } from '@/components/WebLinks/WebLinks.types'

/** Set the free-text filter query for the collection grid. */
export function setFilterQueryAction(
  set: (partial: Partial<WebLinksStoreState>) => void,
  query: string,
): void {
  set({ filterQuery: query })
}
