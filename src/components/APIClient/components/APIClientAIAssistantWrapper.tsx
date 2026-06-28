import { AIAssistantPanelDataProvider } from '@/right-panels/AIAssistantPanel'

import { useAPIClientAIAssistantData } from '../hooks/useAPIClientAIAssistantData'

export function APIClientAIAssistantWrapper(props: {
  children: React.ReactNode
}): React.JSX.Element {
  const { children } = props
  const { data, actions } = useAPIClientAIAssistantData()

  return (
    <AIAssistantPanelDataProvider data={data} actions={actions}>
      {children}
    </AIAssistantPanelDataProvider>
  )
}
