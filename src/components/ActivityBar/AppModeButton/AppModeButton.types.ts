import type { AppView } from '../ActivityBar.types'

export interface AppModeButtonProps {
  mode: AppView
  icon: React.ComponentType<{ size: number; strokeWidth?: number }>
  label: string
  tooltip?: string
  shortcutId?: string
  isActive: boolean
  isActivated: boolean
  onSelect: (mode: AppView) => void
  onDeactivate?: (mode: AppView) => void
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right'
  showLabel?: boolean
  /**
   * When `showLabel` is true, controls label layout: `true` renders a
   * left-aligned, full-width row (vertical left/right bar); `false` keeps the
   * icon + label centered with auto width (horizontal top/bottom bar).
   */
  labelLeftAlign?: boolean
  hideContextMenu?: boolean
  /**
   * When true (default) the button participates in ActivityBar drag-to-reorder
   * / drag-to-detach via `@dnd-kit`. Set to false for buttons rendered outside
   * a `SortableContext` (e.g. the footer Settings button).
   */
  sortable?: boolean
}
