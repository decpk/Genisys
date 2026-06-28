import type { SmartCollectionKey } from '../../utils/smart-collections'

export interface SmartCollectionsSidebarProps {
  activeFilter: string
  onFilterChange: (filter: `smart:${SmartCollectionKey}`) => void
  className?: string
}
