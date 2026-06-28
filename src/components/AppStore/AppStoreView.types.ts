import type { AppView } from '@/components/ActivityBar'

import type { AppCategoryId } from './AppStore.types'

/**
 * Discriminated union of the views the App Store can be on. Driven by
 * the sidebar + search box. Persisted only in-memory for the life of
 * the app session.
 */
export type AppStoreView =
  | { kind: 'discover' }
  | { kind: 'all' }
  | { kind: 'installed' }
  | { kind: 'category'; id: AppCategoryId }
  | { kind: 'search'; query: string }
  | { kind: 'detail'; appId: AppView }

export interface AppStoreViewContextValue {
  view: AppStoreView
  setView: (next: AppStoreView) => void
  openDiscover: () => void
  openAll: () => void
  openInstalled: () => void
  openCategory: (id: AppCategoryId) => void
  openDetail: (appId: AppView) => void
  setSearchQuery: (query: string) => void
}
