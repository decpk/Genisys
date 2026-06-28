import { useWebpointStore } from '@/store/webpoint-store'

export function useWebpointMainData() {
  const activePresentation = useWebpointStore((s) => s.activePresentation)
  const activeSlideId = useWebpointStore((s) => s.activeSlideId)
  const isLoadingPresentation = useWebpointStore((s) => s.isLoadingPresentation)
  const selectPresentation = useWebpointStore((s) => s.selectPresentation)

  const slides = activePresentation?.slides ?? []
  const activeSlide = slides.find((slide) => slide.id === activeSlideId) ?? null

  const onBack = (): void => {
    void selectPresentation(null)
  }

  return {
    isLoading: isLoadingPresentation && activePresentation === null,
    presentationTitle: activePresentation?.presentation.title ?? '',
    activeSlide,
    onBack,
  }
}
