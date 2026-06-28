import { AIAssistantPanelDataProvider } from '@/right-panels/AIAssistantPanel'

import { useClipboardAIAssistantData } from '../../hooks/useClipboardAIAssistantData'

export function ClipboardAIAssistantWrapper({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  const { data, actions } = useClipboardAIAssistantData()

  return (
    <AIAssistantPanelDataProvider data={data} actions={actions}>
      {children}
    </AIAssistantPanelDataProvider>
  )
}
