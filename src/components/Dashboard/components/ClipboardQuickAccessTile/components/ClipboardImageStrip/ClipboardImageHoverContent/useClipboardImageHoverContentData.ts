import { useEffect, useState } from 'react'

import { fetchClipboardImageDataUrl } from '../api/fetchClipboardImageDataUrl'

import type {
  UseClipboardImageHoverContentDataParams,
  UseClipboardImageHoverContentDataResult,
} from './ClipboardImageHoverContent.types'

/**
 * Fetches the full-resolution clipboard image on mount (preferring
 * `imagePath`, falling back to `thumbnailPath`). Tracks loading +
 * error state and cancels the in-flight request on unmount.
 *
 * Each `ClipboardImageHoverContent` instance is mounted when the
 * Radix HoverCard opens and unmounts when it closes, so the resolved
 * `sourcePath` is stable for the component's lifetime. Initial state
 * is derived from the path via lazy initializers — the effect only
 * mutates state from async callbacks, never synchronously.
 */
export function useClipboardImageHoverContentData(
  params: UseClipboardImageHoverContentDataParams
): UseClipboardImageHoverContentDataResult {
  const { imagePath, thumbnailPath } = params
  const sourcePath = imagePath ?? thumbnailPath
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [hasError, setHasError] = useState<boolean>(() => !sourcePath)
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(sourcePath))

  useEffect(() => {
    if (!sourcePath) return

    let cancelled = false

    fetchClipboardImageDataUrl(sourcePath)
      .then((url) => {
        if (cancelled) return
        setDataUrl(url)
        setIsLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setHasError(true)
        setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [sourcePath])

  return { isLoading, hasError, dataUrl }
}
