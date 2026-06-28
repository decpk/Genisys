import type { PaletteItem } from '../../CommandPalette.types'

export interface PaletteListProps {
  items: PaletteItem[]
  firstNonRecentIndex: number
  selectedIndex: number
  onSelectIndex: (index: number) => void
  onInvoke: (item: PaletteItem) => void
}
