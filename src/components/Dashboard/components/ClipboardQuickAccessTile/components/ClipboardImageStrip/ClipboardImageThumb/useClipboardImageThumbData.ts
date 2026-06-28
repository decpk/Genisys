import { useCallback, useEffect, useRef, useState } from 'react'

import { useWindowSize } from '@/hooks/useWindowSize'

import { fetchClipboardImageDataUrl } from '../api/fetchClipboardImageDataUrl'

import type {
  UseClipboardImageThumbDataParams,
  UseClipboardImageThumbDataResult,
} from './ClipboardImageThumb.types'

const POPOVER_WIDTH_RATIO = 0.5
const POPOVER_HEIGHT_RATIO = 0.5
const MIN_POPOVER_WIDTH = 480
const MIN_POPOVER_HEIGHT = 400

/**
 * Drives the thumbnail tile: lazy-loads the thumbnail bytes once the
 * tile scrolls into view (IntersectionObserver), tracks HoverCard
 * open state for the surrounding backdrop, and computes the popover
 * dimensions as 50% of the current window size with a sane floor.
 * Cleans up its async fetch on unmount.
 */
export function useClipboardImageThumbData(
  params: UseClipboardImageThumbDataParams
): UseClipboardImageThumbDataResult {
  const { thumbnailPath } = params
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)
  const [isHoverOpen, setIsHoverOpen] = useState(false)
  const { width: windowWidth, height: windowHeight } = useWindowSize()

  const popoverWidth = Math.max(
    Math.round(windowWidth * POPOVER_WIDTH_RATIO),
    MIN_POPOVER_WIDTH
  )
  const popoverHeight = Math.max(
    Math.round(windowHeight * POPOVER_HEIGHT_RATIO),
    MIN_POPOVER_HEIGHT
  )

  // Lazy-load when scrolled into view
  useEffect(() => {
    const el = triggerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Fetch thumbnail bytes once visible
  useEffect(() => {
    if (!isVisible || !thumbnailPath) return
    let cancelled = false
    fetchClipboardImageDataUrl(thumbnailPath)
      .then((url) => {
        if (!cancelled) setDataUrl(url)
      })
      .catch(() => {
        if (!cancelled) setHasError(true)
      })
    return () => {
      cancelled = true
    }
  }, [isVisible, thumbnailPath])

  const onHoverOpenChange = useCallback((open: boolean): void => {
    setIsHoverOpen(open)
  }, [])

  return {
    triggerRef,
    dataUrl,
    hasError,
    isHoverOpen,
    onHoverOpenChange,
    popoverWidth,
    popoverHeight,
  }
}
