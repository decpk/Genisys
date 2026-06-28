import { replaceSlideElement } from '@/lib/webpoint/replaceSlideElement'
import { useWebpointStore } from '@/store/webpoint-store'
import type {
  SlideBackground,
  SlideData,
  SlideElement,
  SlideTransition,
} from '@/store/webpoint-store/types'

export function useWebpointInspectorData() {
  const activePresentation = useWebpointStore((s) => s.activePresentation)
  const activeSlideId = useWebpointStore((s) => s.activeSlideId)
  const selectedElementId = useWebpointStore((s) => s.selectedElementId)
  const setSelectedElement = useWebpointStore((s) => s.setSelectedElement)
  const updateSlideData = useWebpointStore((s) => s.updateSlideData)
  const updateSlide = useWebpointStore((s) => s.updateSlide)

  const slide = activePresentation?.slides.find((sl) => sl.id === activeSlideId) ?? null
  const selectedElement = slide?.data.elements.find((el) => el.id === selectedElementId) ?? null

  const commit = (data: SlideData): void => {
    if (slide) void updateSlideData(slide.id, data)
  }

  const updateElement = (element: SlideElement): void => {
    if (slide) commit(replaceSlideElement(slide.data, element))
  }
  const deleteElement = (id: string): void => {
    if (!slide) return
    commit({ ...slide.data, elements: slide.data.elements.filter((el) => el.id !== id) })
    setSelectedElement(null)
  }
  const addElement = (element: SlideElement): void => {
    if (!slide) return
    commit({ ...slide.data, elements: [...slide.data.elements, element] })
    setSelectedElement(element.id)
  }
  const updateBackground = (background: SlideBackground): void => {
    if (slide) commit({ ...slide.data, background })
  }
  const updateTransition = (transition: SlideTransition): void => {
    if (slide) commit({ ...slide.data, transition })
  }
  const updateNotes = (notes: string): void => {
    if (slide) void updateSlide({ ...slide, notes })
  }

  return {
    slide,
    selectedElement,
    updateElement,
    deleteElement,
    addElement,
    updateBackground,
    updateTransition,
    updateNotes,
  }
}
