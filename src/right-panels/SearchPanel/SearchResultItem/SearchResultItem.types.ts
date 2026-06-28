import type { SearchPanelMatch } from '../SearchPanel.types'

export interface SearchResultItemProps {
  match: SearchPanelMatch
  isActive: boolean
  searchQuery: string
  onNavigate: (index: number) => void
  showSeparator: boolean
}
