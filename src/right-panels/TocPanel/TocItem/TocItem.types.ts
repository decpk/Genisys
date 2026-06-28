import type { TocItem } from '../TocPanel.types'

export interface TocItemProps {
  item: TocItem
  isActive: boolean
  showSeparator: boolean
  activeItemRef: ((node: HTMLButtonElement | null) => void) | undefined
  onNavigate: (id: string) => void
}
