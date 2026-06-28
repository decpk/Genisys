export interface SearchPanelMatch {
  id: string
  index: number
  text: string
  surroundingText: string
}

export interface SearchPanelData {
  searchQuery: string
  currentMatchIndex: number
  totalMatches: number
  matches: SearchPanelMatch[]
}

export interface SearchPanelActions {
  [key: string]: (...args: never[]) => void
  setSearchQuery: (q: string) => void
  navigateMatch: (direction: 'next' | 'prev') => void
  scrollToMatch: (index: number) => void
  clearSearch: () => void
  registerFocusCallback: (cb: (() => void) | null) => void
}

export interface SearchResultItemProps {
  match: SearchPanelMatch
  isActive: boolean
  searchQuery: string
  onNavigate: (index: number) => void
  showSeparator: boolean
}
