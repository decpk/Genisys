import type { AppCategory } from '../../AppStore.types'

export interface AppStoreCategoryTileProps {
  category: AppCategory
  /** Number of apps in the category, shown as a count. */
  count: number
  onClick: () => void
}
