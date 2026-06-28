import { AIAssistantPanelDataProvider } from '@/right-panels/AIAssistantPanel'

import { useMockServerAIAssistantData } from './useMockServerAIAssistantData'

export function MockServerAIAssistantWrapper(props: {
  children: React.ReactNode
}): React.JSX.Element {
  const { children } = props
  const { data, actions } = useMockServerAIAssistantData()

  return (
    <AIAssistantPanelDataProvider data={data} actions={actions}>
      {children}
    </AIAssistantPanelDataProvider>
  )
}
