import { useMemo } from 'react'

import { useWebLinksStore } from '@/store/weblinks-store'
import { selectVisiblePreviews } from '@/components/WebLinks/utils/selectVisiblePreviews'

import type { CollectionViewModel } from './CollectionView.types'
import { resolveCollectionState } from './utils/resolveCollectionState'

/**
 * Reads the collection slice from the store (each field as its own selector,
 * never a fresh literal) and derives the visible list + render state with
 * `useMemo`, per the project's zustand rules.
 */
export function useCollectionViewData(): CollectionViewModel {
  const previews = useWebLinksStore((state) => state.previews)
  const selectedFolder = useWebLinksStore((state) => state.selectedFolder)
  const sortKey = useWebLinksStore((state) => state.sortKey)
  const sortDirection = useWebLinksStore((state) => state.sortDirection)
  const filterQuery = useWebLinksStore((state) => state.filterQuery)
  const isLoaded = useWebLinksStore((state) => state.isLoaded)

  const visible = useMemo(
    () => selectVisiblePreviews(previews, { selectedFolder, sortKey, sortDirection, filterQuery }),
    [previews, selectedFolder, sortKey, sortDirection, filterQuery],
  )

  const state = resolveCollectionState(isLoaded, previews.length, visible.length)

  return { state, visible }
}
