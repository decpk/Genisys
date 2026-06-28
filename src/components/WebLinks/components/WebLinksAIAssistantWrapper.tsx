import { AIAssistantPanelDataProvider } from '@/right-panels/AIAssistantPanel'

import { useWebLinksAIAssistantData } from '../hooks/useWebLinksAIAssistantData'

export function WebLinksAIAssistantWrapper(props: {
  children: React.ReactNode
}): React.JSX.Element {
  const { children } = props
  const { data, actions } = useWebLinksAIAssistantData()

  return (
    <AIAssistantPanelDataProvider data={data} actions={actions}>
      {children}
    </AIAssistantPanelDataProvider>
  )
}
