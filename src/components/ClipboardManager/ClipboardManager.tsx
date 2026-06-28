import { AppShell } from '@/components/AppShell'
import { AppShellLoader } from '@/components/AppLoader'
import { RightPanel } from '@/components/RightPanel'
import { RightPanelTabs } from '@/frameworks/right-panel'

import { useClipboardManagerData } from './hooks/useClipboardManagerData'
import { ClipboardSidebar } from './components/ClipboardSidebar'
import { ClipboardContent } from './components/ClipboardContent'
import { CLIPBOARD_PANELS } from './constants/clipboardPanels'

export function ClipboardManager(): React.JSX.Element {
  const { isLoaded } = useClipboardManagerData()

  if (!isLoaded) return <AppShellLoader />

  return (
    <AppShell
      appId="clipboard"
      sidebar={<ClipboardSidebar />}
      rightPanel={
        <RightPanel
          appId="clipboard-ai"
          defaultWidth={320}
          minWidth={280}
          maxWidth={500}
          defaultOpen
        >
          <RightPanelTabs panels={CLIPBOARD_PANELS} />
        </RightPanel>
      }
    >
      <ClipboardContent />
    </AppShell>
  )
}
