import type { AppCatalogEntry } from '../../AppStore.types'

export interface AppStoreActionButtonProps {
  app: AppCatalogEntry
  size?: 'sm' | 'md'
  variant?: 'pill' | 'default'
}
