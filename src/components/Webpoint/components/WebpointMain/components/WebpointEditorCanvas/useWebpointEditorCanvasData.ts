import { useRef } from 'react'

import { replaceSlideElement } from '@/lib/webpoint/replaceSlideElement'
import { slideBackgroundToCss } from '@/lib/webpoint/slideBackgroundToCss'
import { useWebpointStore } from '@/store/webpoint-store'
import type { Slide, SlideElement } from '@/store/webpoint-store/types'

export function useWebpointEditorCanvasData(slide: Slide | null) {
  const selectedElementId = useWebpointStore((s) => s.selectedElementId)
  const setSelectedElement = useWebpointStore((s) => s.setSelectedElement)
  const updateSlideData = useWebpointStore((s) => s.updateSlideData)
  const canvasRef = useRef<HTMLDivElement>(null)

  const onChangeElement = (element: SlideElement): void => {
    if (!slide) return
    void updateSlideData(slide.id, replaceSlideElement(slide.data, element))
  }
  const onSelect = (id: string): void => {
    setSelectedElement(id)
  }
  const onDeselect = (): void => {
    setSelectedElement(null)
  }

  const background = slide ? slideBackgroundToCss(slide.data.background) : 'transparent'
  const elements = slide?.data.elements ?? []

  return { canvasRef, background, elements, selectedElementId, onSelect, onDeselect, onChangeElement }
}
