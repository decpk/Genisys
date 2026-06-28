import type { TileWidth } from '@/store/dashboard-store'
import type { DragHandleProps } from '../SortableTile/SortableTile.types'

export interface ClipboardQuickAccessTileProps {
  tileWidth: TileWidth
  onWidthChange: (width: TileWidth) => void
  dragHandleProps: DragHandleProps
}
