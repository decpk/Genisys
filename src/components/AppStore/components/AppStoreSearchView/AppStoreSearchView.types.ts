import type { AppCatalogEntry } from '../../AppStore.types'

export interface AppStoreSearchViewProps {
  query: string
}

export interface SearchMatch {
  app: AppCatalogEntry
  score: number
}
