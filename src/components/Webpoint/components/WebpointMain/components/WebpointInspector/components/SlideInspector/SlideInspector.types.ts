import type {
  Slide,
  SlideBackground,
  SlideElement,
  SlideTransition,
} from '@/store/webpoint-store/types'

export interface SlideInspectorProps {
  slide: Slide
  onAddElement: (element: SlideElement) => void
  onChangeBackground: (background: SlideBackground) => void
  onChangeTransition: (transition: SlideTransition) => void
  onChangeNotes: (notes: string) => void
}
