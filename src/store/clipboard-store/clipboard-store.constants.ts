import type { ClipboardState } from './clipboard-store.types'

export const CLIPBOARD_INITIAL_STATE: ClipboardState = {
  items: [],
  hasMore: true,
  cursor: null,
  offset: 0,
  isLoading: false,
  isLoaded: false,
  filter: 'all',
  searchQuery: '',
  isFuzzySearch: false,
  stats: { total: 0, textCount: 0, imageCount: 0, labeledCount: 0, pinnedCount: 0 },
  previewItemId: null,
}
