import { createPanelDataContext } from '@/frameworks/right-panel'

import type { TocPanelActions, TocPanelData } from './TocPanel.types'

export const {
  Provider: TocPanelDataProvider,
  usePanelData: useTocPanelContextData,
  useData: useTocData,
  useActions: useTocActions,
} = createPanelDataContext<TocPanelData, TocPanelActions>('TocPanelData')
