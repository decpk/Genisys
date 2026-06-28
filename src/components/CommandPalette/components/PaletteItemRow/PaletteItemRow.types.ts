import type { PaletteItem } from '../../CommandPalette.types'

export interface PaletteItemProps {
  item: PaletteItem
  isSelected: boolean
  onHover: () => void
  onSelect: () => void
}
