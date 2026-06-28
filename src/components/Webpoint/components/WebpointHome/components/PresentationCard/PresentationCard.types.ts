import type { PresentationMeta } from '@/store/webpoint-store/types'

export interface PresentationCardProps {
  presentation: PresentationMeta
  onSelect: (id: string) => void
  onRemove: (id: string) => void
}
