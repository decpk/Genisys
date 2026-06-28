import { createPanelDataContext } from '@/frameworks/right-panel'

import type { SearchPanelActions, SearchPanelData } from './SearchPanel.types'

export const {
  Provider: SearchPanelDataProvider,
  usePanelData: useSearchPanelContextData,
  useData: useSearchData,
  useActions: useSearchActions,
} = createPanelDataContext<SearchPanelData, SearchPanelActions>('SearchPanelData')
