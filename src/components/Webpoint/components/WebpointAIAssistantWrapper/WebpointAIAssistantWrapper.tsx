import { AIAssistantPanelDataProvider } from '@/right-panels/AIAssistantPanel'

import { useWebpointAIAssistantData } from './useWebpointAIAssistantData'

export function WebpointAIAssistantWrapper(props: {
  children: React.ReactNode
}): React.JSX.Element {
  const { children } = props
  const { data, actions } = useWebpointAIAssistantData()

  return (
    <AIAssistantPanelDataProvider data={data} actions={actions}>
      {children}
    </AIAssistantPanelDataProvider>
  )
}
