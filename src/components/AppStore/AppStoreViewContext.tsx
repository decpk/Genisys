import { createContext, useContext } from 'react'

import type { AppStoreViewContextValue } from './AppStoreView.types'

/**
 * Context that gives every child of the App Store tree access to the
 * current view + the navigators used by sidebar items, cards, and the
 * back button on the detail page. Strictly local to the AppStore
 * component tree; not exported outside this folder.
 */
export const AppStoreViewContext =
  createContext<AppStoreViewContextValue | null>(null)

export function useAppStoreView(): AppStoreViewContextValue {
  const ctx = useContext(AppStoreViewContext)
  if (!ctx) {
    throw new Error(
      'useAppStoreView must be used inside <AppStoreViewContext.Provider>',
    )
  }
  return ctx
}
