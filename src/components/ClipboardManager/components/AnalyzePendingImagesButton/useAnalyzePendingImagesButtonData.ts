import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useClipboardStore } from '@/store/clipboard-store'
import { resolveClipboardVisionModel } from '@/lib/resolveAppModel'
import type { ClipboardItem } from '@/store/clipboard-store'

interface AnalyzeProgress {
  current: number
  total: number
}

interface UseAnalyzePendingImagesButtonDataReturn {
  pendingCount: number
  isAnalyzing: boolean
  progress: AnalyzeProgress
  handleClick: () => void
}

const NEEDS_ANALYSIS_STATUSES: ReadonlyArray<ClipboardItem['analysisStatus']> = [
  'none',
  'failed',
]

function isAnalyzable(item: ClipboardItem): boolean {
  return (
    item.contentType === 'image' &&
    !!item.imagePath &&
    NEEDS_ANALYSIS_STATUSES.includes(item.analysisStatus)
  )
}

/**
 * Drives the "Analyze pending images" toolbar button.
 *
 * Operates on the currently-loaded clipboard items only — items where
 * `analysisStatus` is `'none'` or `'failed'`. Items in `'pending'` are
 * skipped because they are already being analyzed by the auto-describe
 * listener (`useClipboardEvents`) or another in-flight call.
 *
 * Processing is sequential: one image at a time. Clicking the button while
 * a batch is in progress cancels the queue (the in-flight backend call
 * cannot be aborted; the loop simply stops after it resolves).
 */
export function useAnalyzePendingImagesButtonData(): UseAnalyzePendingImagesButtonDataReturn {
  const items = useClipboardStore((s) => s.items)
  const updateItemAnalysis = useClipboardStore((s) => s.updateItemAnalysis)

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState<AnalyzeProgress>({ current: 0, total: 0 })

  const cancelRef = useRef(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      cancelRef.current = true
    }
  }, [])

  const pendingCount = useMemo(() => items.filter(isAnalyzable).length, [items])

  const start = useCallback(async () => {
    const queue = useClipboardStore
      .getState()
      .items.filter(isAnalyzable)
      .map((item) => ({ id: item.id, imagePath: item.imagePath as string }))

    if (queue.length === 0) return

    cancelRef.current = false
    setIsAnalyzing(true)
    setProgress({ current: 0, total: queue.length })

    for (let i = 0; i < queue.length; i++) {
      if (cancelRef.current) break

      const { id, imagePath } = queue[i]

      // Skip items that have since been analyzed (e.g. via auto-analyze) or
      // were already kicked off by another flow.
      const current = useClipboardStore.getState().items.find((it) => it.id === id)
      if (current && current.analysisStatus !== 'none' && current.analysisStatus !== 'failed') {
        if (mountedRef.current) setProgress({ current: i + 1, total: queue.length })
        continue
      }

      try {
        updateItemAnalysis(id, null, 'pending')
        await window.api.analyzeClipboardImage(id, imagePath, resolveClipboardVisionModel())
      } catch (err) {
        console.error('[clipboard] analyze pending image failed:', id, err)
      }

      if (mountedRef.current) setProgress({ current: i + 1, total: queue.length })
    }

    if (mountedRef.current) {
      setIsAnalyzing(false)
      setProgress({ current: 0, total: 0 })
    }
    cancelRef.current = false
  }, [updateItemAnalysis])

  const cancel = useCallback(() => {
    cancelRef.current = true
  }, [])

  const handleClick = useCallback(() => {
    if (isAnalyzing) {
      cancel()
    } else {
      void start()
    }
  }, [isAnalyzing, cancel, start])

  return {
    pendingCount,
    isAnalyzing,
    progress,
    handleClick,
  }
}
