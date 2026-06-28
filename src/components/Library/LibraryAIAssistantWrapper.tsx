import { AIAssistantPanelDataProvider } from '@/right-panels/AIAssistantPanel'

import { useLibraryAIAssistantData } from './useLibraryAIAssistantData'

export function LibraryAIAssistantWrapper({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  const { data, actions } = useLibraryAIAssistantData()

  return (
    <AIAssistantPanelDataProvider data={data} actions={actions}>
      {children}
    </AIAssistantPanelDataProvider>
  )
}
