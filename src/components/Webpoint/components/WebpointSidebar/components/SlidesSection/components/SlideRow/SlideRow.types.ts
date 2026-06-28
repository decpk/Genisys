import type { Slide } from '@/store/webpoint-store/types'

export interface SlideRowProps {
  slide: Slide
  index: number
  isActive: boolean
  onSelect: (id: string) => void
  onRemove: (id: string) => void
}
