import type { ReactNode } from 'react'

import type { IconButtonProps } from '@/components/ui/icon-button'

export interface DropdownItem {
  key: string
  label: string
  description?: string
  icon?: React.ComponentType<{ size: number; className?: string }>
  endIcon?: React.ComponentType<{ size: number; className?: string }>
  active?: boolean
  prefix?: ReactNode
  suffix?: ReactNode
  /** Per-item override for the dropdown-level `keepOpenOnSelect`. */
  keepOpenOnSelect?: boolean
  /**
   * Marks the item as a destructive action (e.g. Delete). Renders with the
   * app-wide destructive variant: subtle red bg + red text/icon normally,
   * darker red bg on hover/focus. Matches the radix DropdownMenuItem
   * `text-destructive` convention used elsewhere in the app.
   */
  destructive?: boolean
  onSelect: () => void
}

export interface DropdownGroup {
  key: string
  label?: string
  icon?: React.ComponentType<{ size: number; className?: string }>
  items: DropdownItem[]
}

export type DropdownAlign = 'left' | 'right'
export type DropdownSide = 'top' | 'bottom'
export type DropdownOpenOn = 'hover' | 'click'

/** Imperative handle exposed via a ref on `Dropdown`. */
export interface DropdownHandle {
  /** Open the menu anchored at a viewport point (e.g. a right-click position). */
  openAtPoint: (x: number, y: number) => void
  /** Close the menu. */
  close: () => void
}

export interface DropdownProps {
  items?: DropdownItem[]
  groups?: DropdownGroup[]
  trigger: ReactNode
  triggerProps?: Omit<IconButtonProps, 'children'>
  align?: DropdownAlign
  side?: DropdownSide
  openOn?: DropdownOpenOn
  className?: string
  menuClassName?: string
  showCheck?: boolean
  /**
   * Width of the popup menu. Accepts any CSS length string (`"240px"`,
   * `"fit-content"`, …) or the special value `"trigger"` which matches
   * the trigger element's measured width. Avoid percentages — the menu is
   * portaled to <body>, so `"100%"` resolves to the full viewport.
   */
  menuWidth?: string
  maxHeight?: string
  /**
   * When true, the trigger wrapper expands to fill its parent's width
   * (becomes `flex w-full` instead of `inline-flex`). Useful for pill-style
   * triggers inside form rows that need to truncate their label.
   */
  fill?: boolean
  /** Called when keyboard navigation highlights an item (for live preview). */
  onHighlight?: (item: DropdownItem) => void
  /** Called when the dropdown is dismissed without selection (Escape / click‑outside). */
  onDismiss?: () => void
  /** When true, the dropdown stays open after selecting an item. */
  keepOpenOnSelect?: boolean
}

export interface DropdownMenuProps {
  items?: DropdownItem[]
  groups?: DropdownGroup[]
  align?: DropdownAlign
  side?: DropdownSide
  menuClassName?: string
  showCheck?: boolean
  menuWidth?: string
  maxHeight?: string
  triggerRect: DOMRect | null
  onClose: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onHighlight?: (item: DropdownItem) => void
  onDismiss?: () => void
  keepOpenOnSelect?: boolean
}

export interface DropdownMenuItemProps {
  item: DropdownItem
  showCheck: boolean
  highlighted?: boolean
  onClose: () => void
  onMouseEnter?: () => void
  keepOpenOnSelect?: boolean
}

export interface DropdownMenuGroupProps {
  group: DropdownGroup
  showSeparator: boolean
  showCheck: boolean
  highlightedKey?: string | null
  onClose: () => void
  onItemMouseEnter?: (key: string) => void
  keepOpenOnSelect?: boolean
}

export interface DropdownTriggerProps {
  trigger: ReactNode
  triggerProps?: Omit<IconButtonProps, 'children'>
  open: boolean
  onClick?: () => void
  fill?: boolean
}
