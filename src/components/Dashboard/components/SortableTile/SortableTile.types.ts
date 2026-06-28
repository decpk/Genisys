import type { TileWidth } from '@/store/dashboard-store'
import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'

export interface DragHandleProps {
  attributes: DraggableAttributes
  listeners: SyntheticListenerMap | undefined
}

export interface SortableTileProps {
  id: string
  tileWidth: TileWidth
  onWidthChange: (width: TileWidth) => void
  /** Pre-computed `col-span-*` class. Overrides the default width mapping (used for `fill`). */
  colSpanClass?: string
  children: (dragHandleProps: DragHandleProps) => React.ReactNode
}
