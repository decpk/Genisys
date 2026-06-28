import type { TileWidth } from '@/store/dashboard-store'
import type { DragHandleProps } from '../SortableTile/SortableTile.types'

export interface CurrentlyReadingTileProps {
  tileWidth: TileWidth
  onWidthChange: (width: TileWidth) => void
  dragHandleProps: DragHandleProps
}
