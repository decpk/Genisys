import { BarChart3, Clock, ClipboardList, Search, Sparkles } from 'lucide-react'
import { useState, useCallback } from 'react'

import { AppShell } from '@/components/AppShell'
import { AppShellLoader } from '@/components/AppLoader'
import { RightPanel } from '@/components/RightPanel'
import { RightPanelTabs } from '@/frameworks/right-panel'
import type { PanelDef } from '@/frameworks/right-panel'
import { AIAssistantPanel } from '@/right-panels/AIAssistantPanel'
import { DailyStatusPanel } from '@/right-panels/DailyStatusPanel'
import { TimelinePanel } from '@/right-panels/TimelinePanel'

import { DailyPlanSidebar } from './components/DailyPlanSidebar'
import { DailyPlanMainContent } from './components/DailyPlanMainContent'
import { DailyPlanAIAssistantWrapper } from './ai'
import { DailyPlanSearchPanel } from './components/DailyPlanSearchPanel'
import { ProductivityAnalytics } from './components/ProductivityAnalytics'
import { useDailyPlanData } from './useDailyPlanData'
import { useDailyPlanSearchShortcut } from './hooks/useDailyPlanSearchShortcut'

const DAILYPLAN_PANELS: PanelDef[] = [
  {
    id: "timeline",
    label: "Timeline",
    icon: Clock,
    component: TimelinePanel,
    defaultTab: true,
    keepAlive: true,
  },
  {
    id: "status",
    label: "Daily Status",
    icon: ClipboardList,
    component: DailyStatusPanel,
    keepAlive: true,
  },
  {
    id: "search",
    label: "Search",
    icon: Search,
    component: DailyPlanSearchPanel,
  },
  {
    id: "ai",
    label: "AI",
    icon: Sparkles,
    component: AIAssistantPanel,
    keepAlive: true,
    wrapper: DailyPlanAIAssistantWrapper,
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    component: ProductivityAnalytics,
  },
];

export function DailyPlan(): React.JSX.Element {
  const { isLoaded } = useDailyPlanData()

  const [activeTab, setActiveTab] = useState('timeline')
  const [rightPanelOpen, setRightPanelOpen] = useState(true)

  useDailyPlanSearchShortcut({ setRightPanelOpen, setActiveTab })

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId)
  }, [])

  if (!isLoaded) return <AppShellLoader />

  return (
    <AppShell
      appId="dailyplan"
      sidebar={<DailyPlanSidebar />}
      sidebarWidth={280}
      rightPanel={
        <RightPanel
          appId="dailyplan-timeline"
          defaultWidth={500}
          minWidth={300}
          maxWidth={600}
          defaultOpen
          open={rightPanelOpen}
          onOpenChange={setRightPanelOpen}
        >
          <RightPanelTabs
            panels={DAILYPLAN_PANELS}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </RightPanel>
      }
    >
      <DailyPlanMainContent />
    </AppShell>
  );
}
