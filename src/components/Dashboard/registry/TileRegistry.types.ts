import type { TileWidth } from '@/store/dashboard-store'
import type { DragHandleProps } from '../components/SortableTile/SortableTile.types'

/**
 * Discriminator describing the *kind* of registered tile.
 * New tiles must add a new literal here so consumers can switch on `kind`
 * (e.g. for filtering, ordering, or analytics) without inspecting the id.
 */
export type TileKind =
  | 'snippets'
  | 'news'
  | 'stocks'
  | 'live-sports'
  | 'todays-agenda'
  | 'currently-reading'
  | 'clipboard-quick-access'
  | 'quick-prompts'
  | 'timer'
  | 'keep-awake'
  | 'time-calendar'

/**
 * Legacy `kind` value previously used for the old focus-timer dashboard
 * tile. Kept as a re-export so any persisted user data referencing the
 * old kind string can be detected and migrated by consumers.
 */
export const LEGACY_TIMER_KIND_ALIAS = 'focus-timer'

export interface RegisteredTile {
  /** Unique stable id, used by `@dnd-kit` and `tileOrder` persistence. */
  id: string
  /** Discriminator describing what this tile is. */
  kind: TileKind
  /** Current display width — drives `col-span-*`. */
  width: TileWidth
  /** Setter for width changes. Pass a no-op for tiles that disallow resize. */
  setWidth: (width: TileWidth) => void
  /** Render the tile body. Receives drag-handle props from `SortableTile`. */
  render: (handle: DragHandleProps) => React.ReactNode
}

export interface TileRegistry {
  tiles: RegisteredTile[]
  sortableIds: string[]
}
