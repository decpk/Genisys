import type { ViewMode, ViewModeComponentProps } from './ViewModes.types'
import { CompactView } from './CompactView'
import { DetailedView } from './DetailedView'
import { GridView } from './GridView'
import { ListView } from './ListView'
import { ThumbnailView } from './ThumbnailView'

export { CompactView } from './CompactView'
export { DetailedView } from './DetailedView'
export { DetailedRow } from './DetailedRow'
export { GridView } from './GridView'
export { ListView } from './ListView'
export { ThumbnailView } from './ThumbnailView'
export { VIEW_MODE_CONFIG } from './ViewModes.constants'
export type {
  ViewMode,
  ViewModeComponentProps,
  ViewModeConfig,
  SortField,
  SortDirection,
  SortConfig
} from './ViewModes.types'

export const VIEW_MODE_REGISTRY: Record<ViewMode, React.ComponentType<ViewModeComponentProps>> = {
  list: ListView,
  grid: GridView,
  detailed: DetailedView,
  compact: CompactView,
  thumbnail: ThumbnailView
}
