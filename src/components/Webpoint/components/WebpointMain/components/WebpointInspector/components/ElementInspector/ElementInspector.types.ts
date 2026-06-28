import type { SlideElement } from '@/store/webpoint-store/types'

export interface ElementInspectorProps {
  element: SlideElement
  onChange: (element: SlideElement) => void
  onDelete: (id: string) => void
}
