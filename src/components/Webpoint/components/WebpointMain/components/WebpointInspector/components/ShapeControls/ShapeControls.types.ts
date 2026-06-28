import type { ShapeElement } from '@/store/webpoint-store/types'

export interface ShapeControlsProps {
  element: ShapeElement
  onChange: (element: ShapeElement) => void
}
