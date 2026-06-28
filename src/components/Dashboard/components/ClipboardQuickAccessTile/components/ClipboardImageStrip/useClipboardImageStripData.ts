import { useCallback, useMemo } from 'react'

import { useClipboardStore } from '@/store/clipboard-store'
import type { ClipboardItem } from '@/store/clipboard-store/clipboard-store.types'

import { MAX_IMAGES_VISIBLE } from '../../ClipboardQuickAccessTile.constants'

export interface UseClipboardImageStripDataResult {
  images: ClipboardItem[]
  totalImages: number
  onSelect: (id: string) => void
}

/**
 * Returns up to `MAX_IMAGES_VISIBLE` clipboard image items for the
 * dashboard's horizontal image strip. Pinned images come first
 * (sorted by `createdAt` desc), followed by the most recent images.
 *
 * Items without a `thumbnailPath` are excluded so the strip never
 * renders broken thumbnails.
 */
export function useClipboardImageStripData(): UseClipboardImageStripDataResult {
  const items = useClipboardStore((s) => s.items)
  const openPreview = useClipboardStore((s) => s.openPreview)

  const onSelect = useCallback(
    (id: string) => {
      openPreview(id)
    },
    [openPreview]
  )

  return useMemo(() => {
    const byRecent = (a: ClipboardItem, b: ClipboardItem): number =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

    const allImages = items.filter(
      (i) => i.contentType === 'image' && i.thumbnailPath
    )
    const pinned = allImages.filter((i) => i.isPinned).sort(byRecent)
    const unpinned = allImages.filter((i) => !i.isPinned).sort(byRecent)

    const merged = [...pinned, ...unpinned]

    return {
      images: merged.slice(0, MAX_IMAGES_VISIBLE),
      totalImages: allImages.length,
      onSelect,
    }
  }, [items, onSelect])
}
