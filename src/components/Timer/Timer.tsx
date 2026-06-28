import { AppShell } from '@/components/AppShell'
import { AppShellLoader } from '@/components/AppLoader'
import { RightPanel } from '@/components/RightPanel'
import { RightPanelTabs } from '@/frameworks/right-panel'

import { useTimerData } from './hooks/useTimerData'
import { TimerMainContent } from './components/TimerMainContent'
import { TimerSidebar } from './components/TimerSidebar'
import { ResumePendingDialogContainer } from './components/ResumePendingDialog'
import { TIMER_PANELS } from './constants/timerPanels'
import type { TimerProps } from './Timer.types'

export function Timer(_props: TimerProps): React.JSX.Element {
  const { isLoaded } = useTimerData()

  if (!isLoaded) return <AppShellLoader />

  return (
    <>
      <AppShell
        appId="timer"
        sidebar={<TimerSidebar />}
        rightPanel={
          <RightPanel
            appId="timer-right"
            defaultWidth={320}
            minWidth={280}
            maxWidth={500}
            defaultOpen
          >
            <RightPanelTabs panels={TIMER_PANELS} />
          </RightPanel>
        }
      >
        <TimerMainContent />
      </AppShell>
      <ResumePendingDialogContainer />
    </>
  )
}
