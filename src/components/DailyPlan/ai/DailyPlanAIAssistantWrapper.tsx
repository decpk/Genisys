import { AIAssistantPanelDataProvider } from '@/right-panels/AIAssistantPanel'

import { useDailyPlanAIAssistantData } from './useDailyPlanAIAssistantData'

export function DailyPlanAIAssistantWrapper({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  const { data, actions } = useDailyPlanAIAssistantData()

  return (
    <AIAssistantPanelDataProvider data={data} actions={actions}>
      {children}
    </AIAssistantPanelDataProvider>
  )
}
