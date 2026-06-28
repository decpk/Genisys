import { useWebpointStore } from '@/store/webpoint-store'

export function useSlidesSectionData() {
  const activePresentation = useWebpointStore((s) => s.activePresentation)
  const activeSlideId = useWebpointStore((s) => s.activeSlideId)
  const addSlide = useWebpointStore((s) => s.addSlide)
  const selectSlide = useWebpointStore((s) => s.selectSlide)
  const removeSlide = useWebpointStore((s) => s.removeSlide)

  const presentationId = activePresentation?.presentation.id ?? null
  const slides = activePresentation?.slides ?? []

  const onAdd = (): void => {
    if (presentationId) void addSlide(presentationId)
  }
  const onRemove = (slideId: string): void => {
    if (presentationId) void removeSlide(slideId, presentationId)
  }

  return {
    hasPresentation: presentationId !== null,
    slides,
    activeSlideId,
    onAdd,
    onSelect: selectSlide,
    onRemove,
  }
}
