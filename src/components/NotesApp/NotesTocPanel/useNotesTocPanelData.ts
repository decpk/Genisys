import { useMemo, useSyncExternalStore } from 'react'

import { useNotesToc } from '../NotesTocProvider'
import { buildTocPanelData } from './utils/buildTocPanelData'
import { buildTocPanelActions } from './utils/buildTocPanelActions'

/**
 * Adapts the `NotesTocProvider` context into the `{ data, actions }` shape the
 * generic TocPanel framework expects. The active-item id is read via
 * `useSyncExternalStore` so scroll-driven updates don't re-render anything
 * outside the TOC panel.
 */
export function useNotesTocPanelData() {
  const ctx = useNotesToc()
  const { items, getActiveItemId, subscribeActiveItem, scrollToItem } = ctx

  const activeId = useSyncExternalStore(subscribeActiveItem, getActiveItemId, getActiveItemId)

  const data = useMemo(() => buildTocPanelData(items, activeId), [items, activeId])
  const actions = useMemo(() => buildTocPanelActions(scrollToItem), [scrollToItem])

  return { data, actions }
}
