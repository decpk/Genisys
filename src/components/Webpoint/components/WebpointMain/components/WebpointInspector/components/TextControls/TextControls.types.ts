import type { TextElement } from '@/store/webpoint-store/types'

export interface TextControlsProps {
  element: TextElement
  onChange: (element: TextElement) => void
}
