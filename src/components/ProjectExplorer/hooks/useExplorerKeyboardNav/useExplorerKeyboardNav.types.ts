import type { Virtualizer } from '@tanstack/react-virtual'
import type { RefObject } from 'react'

import type { RepoItem } from '../../ProjectExplorer.types'

export type KeyboardNavDirection = 'up' | 'down' | 'left' | 'right' | 'home' | 'end'

export interface KeyboardNavGeometry {
  /** Number of columns in the grid. Use 1 for 1D (list/compact/detailed) views. */
  columns: number
  /** Total item count (equals items.length). */
  itemCount: number
}

export interface UseExplorerKeyboardNavParams {
  /** Sorted, displayed items (the same array the view renders). */
  items: RepoItem[]
  /** Scroll container ref the view mounts. Used for the keydown listener + DOM lookups. */
  scrollRef: RefObject<HTMLDivElement | null>
  /**
   * tanstack-virtual virtualizer instance. The row-virtualizer index is by *row* in 2D
   * views (grid/thumbnail), so the hook converts item index → row index via `columns`.
   */
  virtualizer: Virtualizer<HTMLDivElement, Element>
  /** Number of columns (1 for 1D views, dynamic for grid/thumbnail). */
  columns: number
  /** Currently active item path, or null if nothing is active. */
  activePath: string | null
  /** Setter for the lifted activePath state. */
  onActivePathChange: (path: string | null) => void
  /** Invoked on Enter — opens folder or file. */
  onActivate: (item: RepoItem) => void
  /** Optional Backspace handler — go up one folder. */
  onGoUp?: () => void
}

export interface UseExplorerKeyboardNavResult {
  /** Resolved index of the active item in `items` (-1 if none / not found). */
  activeIndex: number
}
