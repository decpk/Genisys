import type { AppCatalogEntry } from '../../AppStore.types'

export interface AppStoreAppCardProps {
  app: AppCatalogEntry
  /**
   * When true, shows a small category chip under the tagline. Useful in
   * cross-category lists (search results, Installed, Archived) where the
   * app's category isn't otherwise obvious.
   */
  showCategory?: boolean
}
