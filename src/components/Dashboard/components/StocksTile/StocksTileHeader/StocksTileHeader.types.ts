import type { TileWidth } from '@/store/dashboard-store'
import type { DragHandleProps } from '../../SortableTile/SortableTile.types'

export interface StocksTileHeaderProps {
  tileWidth: TileWidth
  onWidthChange: (width: TileWidth) => void
  dragHandleProps: DragHandleProps
  anyLoading: boolean
  autoRefreshEnabled: boolean
  onToggleAutoRefresh: (enabled: boolean) => void
  onRefreshAll: () => void
  onAdd: () => void
  itemCount: number
}
