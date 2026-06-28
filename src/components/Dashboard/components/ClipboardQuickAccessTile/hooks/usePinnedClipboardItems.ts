import { useEffect, useMemo } from 'react'

import { useClipboardStore } from '@/store/clipboard-store'
import type { ClipboardItem } from '@/store/clipboard-store/clipboard-store.types'

import { MAX_ITEMS_VISIBLE } from "../ClipboardQuickAccessTile.constants";

export interface UsePinnedClipboardItemsResult {
  items: ClipboardItem[];
  pinnedCount: number;
  totalAvailable: number;
  isLoaded: boolean;
}

/**
 * Returns up to `MAX_ITEMS_VISIBLE` clipboard items: all pinned items first
 * (sorted by `createdAt` desc), then the most recent items to fill the
 * remaining slots.
 *
 * Triggers a one-shot `loadItems(true)` when the store hasn't been hydrated.
 */
export function usePinnedClipboardItems(): UsePinnedClipboardItemsResult {
  const items = useClipboardStore((s) => s.items)
  const isLoaded = useClipboardStore((s) => s.isLoaded)
  const loadItems = useClipboardStore((s) => s.loadItems)

  useEffect(() => {
    if (!isLoaded) void loadItems(true)
  }, [isLoaded, loadItems])

  return useMemo(() => {
    const byRecent = (a: ClipboardItem, b: ClipboardItem): number =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

    const pinned = items.filter((i) => i.isPinned).sort(byRecent);
    const unpinned = items.filter((i) => !i.isPinned).sort(byRecent);

    const merged = [...pinned, ...unpinned].slice(0, MAX_ITEMS_VISIBLE);

    return {
      items: merged,
      pinnedCount: pinned.length,
      totalAvailable: items.length,
      isLoaded,
    };
  }, [items, isLoaded])
}
