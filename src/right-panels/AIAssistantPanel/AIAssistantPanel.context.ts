import { createPanelDataContext } from '@/frameworks/right-panel'

import type { AIAssistantPanelActions, AIAssistantPanelData } from './AIAssistantPanel.types'

export const {
  Provider: AIAssistantPanelDataProvider,
  usePanelData: useAIAssistantPanelContextData,
  useData: useAIAssistantData,
  useActions: useAIAssistantActions,
} = createPanelDataContext<AIAssistantPanelData, AIAssistantPanelActions>('AIAssistantPanelData')
