import type { SlideElement } from '@/store/webpoint-store/types'

export interface EditableElementProps {
  element: SlideElement
  isSelected: boolean
  canvasRef: React.RefObject<HTMLDivElement | null>
  onSelect: (id: string) => void
  onChange: (element: SlideElement) => void
}
