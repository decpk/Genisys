import { useCallback, useEffect, useMemo, useState } from 'react'

import type { AppView } from '@/components/ActivityBar'
import { useNavigationStore } from '@/store/navigation-store'

import type {
  AppStoreView,
  AppStoreViewContextValue,
} from '../AppStoreView.types'
import type { AppCategoryId } from '../AppStore.types'

/**
 * Owns the App Store's local view state (all / discover / installed /
 * category / search / detail). Defaults to the "All" view. Returns a
 * memoized context value safe to pass to {@link AppStoreViewContext.Provider}.
 */
export function useAppStoreData(): AppStoreViewContextValue {
  const [localView, setLocalView] = useState<AppStoreView>({ kind: 'all' })

  // Deep-link handoff from outside the App Store (e.g. the ActivityBar
  // "App Info" item) sets a pending app id on the navigation store. We
  // derive the detail view from it rather than copying into local state
  // in an effect (which would trip react-hooks/set-state-in-effect), and
  // clear it on any in-store navigation or when the App Store unmounts.
  const pendingDetailId = useNavigationStore((s) => s.pendingAppStoreDetailId)
  const consumeAppStoreDetail = useNavigationStore(
    (s) => s.consumeAppStoreDetail,
  )

  const setView = useCallback(
    (next: AppStoreView) => {
      consumeAppStoreDetail()
      setLocalView(next)
    },
    [consumeAppStoreDetail],
  )

  const openDiscover = useCallback(() => setView({ kind: 'discover' }), [setView])

  const openAll = useCallback(() => setView({ kind: 'all' }), [setView])

  const openInstalled = useCallback(
    () => setView({ kind: 'installed' }),
    [setView],
  )

  const openCategory = useCallback(
    (id: AppCategoryId) => setView({ kind: 'category', id }),
    [setView],
  )

  const openDetail = useCallback(
    (appId: AppView) => setView({ kind: 'detail', appId }),
    [setView],
  )

  const setSearchQuery = useCallback(
    (query: string) => {
      if (query.trim().length === 0) {
        setView({ kind: 'discover' })
        return
      }
      setView({ kind: 'search', query })
    },
    [setView],
  )

  const view = useMemo<AppStoreView>(
    () =>
      pendingDetailId
        ? { kind: 'detail', appId: pendingDetailId }
        : localView,
    [pendingDetailId, localView],
  )

  useEffect(() => {
    return () => {
      consumeAppStoreDetail()
    }
  }, [consumeAppStoreDetail])

  return useMemo<AppStoreViewContextValue>(
    () => ({
      view,
      setView,
      openDiscover,
      openAll,
      openInstalled,
      openCategory,
      openDetail,
      setSearchQuery,
    }),
    [view, setView, openDiscover, openAll, openInstalled, openCategory, openDetail, setSearchQuery],
  )
}
