import { useEffect, useMemo, useRef, useState } from 'react'

import type { AppView } from '@/components/ActivityBar'
import { useSettingsStore } from '@/store/settings-store'

import { getAllSources } from '../sources'
import type { PaletteItem } from '../CommandPalette.types'

const loadedSourceIds = new Set<string>()

/**
 * Single-app palette sources → their owning app. When that app is disabled the
 * whole source is skipped, so its entries never appear or run. Multi-app
 * sources ('apps', 'switchAppCommands', 'createCommands', 'shortcuts') filter
 * their own items by enabled app; 'themes'/'toggleCommands' are app-agnostic.
 */
const SOURCE_APP: Record<string, AppView> = {
  library: 'library',
  notes: 'notes',
  apiClient: 'apiclient',
  bookmarks: 'library',
  clipboard: 'clipboard',
  chat: 'chat',
  mockServer: 'mockserver',
  dailyPlan: 'dailyplan',
  chatCommands: 'chat',
  reviewerSlashCommands: 'reviewer',
}

interface UseCommandPaletteSourcesResult {
  allItems: PaletteItem[]
  isLoading: boolean
}

/**
 * Aggregates items from every registered source. Triggers each source's
 * `load()` exactly once across the lifetime of the app, on first palette open.
 *
 * Re-evaluates `getItems()` when the palette opens or when the user types
 * (driven by `revisionTick`).
 */
export function useCommandPaletteSources(
  isOpen: boolean,
  revisionTick: number,
): UseCommandPaletteSourcesResult {
  const sources = useMemo(() => getAllSources(), [])
  const [loadingCount, setLoadingCount] = useState(0)
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!isOpen || hasInitialized.current) return
    hasInitialized.current = true

    const pending = sources.filter((s) => !loadedSourceIds.has(s.id) && typeof s.load === 'function')
    if (pending.length === 0) return

    setLoadingCount(pending.length)
    for (const src of pending) {
      loadedSourceIds.add(src.id)
      const result = src.load?.()
      Promise.resolve(result)
        .catch(() => {
          /* swallow */
        })
        .finally(() => {
          setLoadingCount((c) => Math.max(0, c - 1))
        })
    }
  }, [isOpen, sources])

  const allItems = useMemo(() => {
    if (!isOpen) return []
    const isAppEnabled = useSettingsStore.getState().isAppEnabled
    const items: PaletteItem[] = []
    for (const src of sources) {
      // Skip a single-app source entirely when its owning app is disabled.
      const ownerApp = SOURCE_APP[src.id]
      if (ownerApp && !isAppEnabled(ownerApp)) continue
      try {
        items.push(...src.getItems())
      } catch {
        /* skip broken source */
      }
    }
    return items
    // revisionTick is intentional — bump it to force re-evaluation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, sources, revisionTick, loadingCount])

  return { allItems, isLoading: loadingCount > 0 }
}
