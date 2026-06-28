import { useEffect, useRef, useState } from 'react'

import type { ClipboardItem } from '@/store/clipboard-store'

import { fetchClipboardThumbnail } from './api/fetchClipboardThumbnail'
import { thumbnailCache } from './utils/thumbnailCache'

import type { UseClipboardImagePreviewDataResult } from './ClipboardImagePreview.types'

/**
 * Drives the lazy clipboard image preview: a single-shot
 * IntersectionObserver (200px rootMargin) flips `isVisible` when the card
 * scrolls near the viewport, then the thumbnail bytes are fetched once.
 *
 * The initial `dataUrl` is seeded from `thumbnailCache` so a card that was
 * scrolled out and back mounts with the image already present — no loading
 * flash and no redundant refetch. Cleans up its async fetch on unmount.
 */
export function useClipboardImagePreviewData(
  item: ClipboardItem,
): UseClipboardImagePreviewDataResult {
  const ref = useRef<HTMLDivElement>(null)
  const [dataUrl, setDataUrl] = useState<string | null>(() =>
    item.thumbnailPath ? thumbnailCache.get(item.thumbnailPath) ?? null : null,
  )
  const [error, setError] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Single-shot lazy trigger once the card scrolls near the viewport.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Fetch (or reuse cached) thumbnail bytes once visible. Skips work when a
  // cached data URL already seeded state (scrolled-back card).
  useEffect(() => {
    if (!isVisible || !item.thumbnailPath || dataUrl) return
    let cancelled = false
    fetchClipboardThumbnail(item.thumbnailPath)
      .then((url) => {
        if (!cancelled) setDataUrl(url)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [isVisible, item.thumbnailPath, dataUrl])

  return { ref, dataUrl, error, isVisible }
}
