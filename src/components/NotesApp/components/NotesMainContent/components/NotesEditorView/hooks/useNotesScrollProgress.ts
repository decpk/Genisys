import { useEffect, useRef } from 'react'

import { applyScrollPercentLabel } from '@/lib/scroll-progress/applyScrollPercentLabel'

import { applyScrollProgressWidth } from '../utils/applyScrollProgressWidth'
import { computeScrollProgress } from '../utils/computeScrollProgress'

/** How long the percentage label stays visible after scrolling stops (ms). */
const LABEL_HIDE_DELAY_MS = 1200

/**
 * Tracks vertical scroll progress of a single editor scroll container and drives
 * a progress-bar element's width via direct DOM mutation (rAF-throttled, no React
 * state, no re-renders). Fully self-contained per editor instance so each pane in
 * split view tracks its own document independently.
 *
 * Also drives a percentage label centered on the fill's leading edge, shown while
 * scrolling and fading out a short while after scrolling stops.
 *
 * Returns refs to attach: `scrollRef` to the scroll container, `progressBarRef`
 * to the bar's fill element, and `percentLabelRef` to the percentage label.
 */
export function useNotesScrollProgress(params: { noteId: string }) {
  const { noteId } = params
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const progressBarRef = useRef<HTMLDivElement | null>(null)
  const percentLabelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Reset on mount / note change so a new document starts at 0%.
    applyScrollProgressWidth(progressBarRef.current, 0)
    applyScrollPercentLabel(percentLabelRef.current, 0)
    if (percentLabelRef.current) percentLabelRef.current.style.opacity = '0'

    const scrollEl = scrollRef.current
    if (!scrollEl) return

    let rafId: number | null = null
    let hideTimer: ReturnType<typeof setTimeout> | null = null

    const handleScroll = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        const progress = computeScrollProgress({
          scrollTop: scrollEl.scrollTop,
          scrollHeight: scrollEl.scrollHeight,
          clientHeight: scrollEl.clientHeight,
        })
        applyScrollProgressWidth(progressBarRef.current, progress)
        applyScrollPercentLabel(percentLabelRef.current, progress)

        const label = percentLabelRef.current
        if (label) {
          label.style.opacity = '1'
          if (hideTimer) clearTimeout(hideTimer)
          hideTimer = setTimeout(() => {
            label.style.opacity = '0'
          }, LABEL_HIDE_DELAY_MS)
        }
      })
    }

    scrollEl.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      scrollEl.removeEventListener('scroll', handleScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
      if (hideTimer) clearTimeout(hideTimer)
    }
  }, [noteId])

  return { scrollRef, progressBarRef, percentLabelRef }
}
