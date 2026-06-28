import { useEffect } from 'react'

import { useWebpointStageData } from '@/components/Webpoint/components/WebpointMain/components/WebpointStage/useWebpointStageData'
import { useWebpointAIStore } from '@/store/webpoint-ai-store'
import { useWebpointStore } from '@/store/webpoint-store'

export function useWebpointPresentData() {
  const activePresentation = useWebpointStore((s) => s.activePresentation)
  const presentIndex = useWebpointAIStore((s) => s.presentIndex)
  const next = useWebpointAIStore((s) => s.presentNext)
  const prev = useWebpointAIStore((s) => s.presentPrev)
  const exit = useWebpointAIStore((s) => s.exitPresenting)

  const slides = activePresentation?.slides ?? []
  const total = slides.length
  const index = Math.max(0, Math.min(presentIndex, total - 1))
  const current = slides[index] ?? null
  const frames = useWebpointStageData(current)

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        prev()
      } else if (e.key === 'Escape') {
        exit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, exit])

  return { current, frames, index, total, onNext: next, onPrev: prev, onExit: exit }
}
