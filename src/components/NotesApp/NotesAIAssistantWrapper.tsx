import { AIAssistantPanelDataProvider } from '@/right-panels/AIAssistantPanel'

import { useNotesAIAssistantData } from './useNotesAIAssistantData'

export function NotesAIAssistantWrapper({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  const { data, actions } = useNotesAIAssistantData()

  return (
    <AIAssistantPanelDataProvider data={data} actions={actions}>
      {children}
    </AIAssistantPanelDataProvider>
  )
}
