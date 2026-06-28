import { useCallback, useEffect, useState } from 'react'

import { ResizablePanel } from '@/components/ResizablePanel'
import { Terminal } from '@/components/Terminal'
import { registerSidebarToggle } from '@/store/panel-toggle-registry'
import { useSettingsStore } from '@/store/settings-store'
import { useTerminalStore } from '@/store/terminal-store'

import { appShellStyles } from './AppShell.styles'
import { AppShellProvider } from './AppShellContext'
import type { AppShellProps } from './AppShell.types'

export function AppShell(props: AppShellProps): React.JSX.Element {
  const {
    appId,
    sidebar,
    sidebarWidth = 300,
    sidebarMinWidth = 200,
    sidebarMaxWidth = 500,
    rightPanel,
    statusBar,
    showTerminal = false,
    children,
  } = props;

  const sidebarPosition = useSettingsStore((s) => s.sidebarPosition)
  const isRight = sidebarPosition === 'right'

  const terminalMaximized = useTerminalStore((s) => s.maximized)
  const terminalOpen = useTerminalStore((s) => s.open)
  const hideMainContent = showTerminal && terminalOpen && terminalMaximized

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleSidebarCollapseChange = useCallback((collapsed: boolean) => {
    setSidebarCollapsed(collapsed)
  }, [])

  useEffect(() => {
    if (!appId) return
    return registerSidebarToggle(appId, () => {
      setSidebarCollapsed((prev) => !prev)
    })
  }, [appId])

  return (
    <AppShellProvider value={appId ?? null}>
      <div className={`flex h-full w-full ${isRight ? 'flex-row-reverse' : ''}`}>
        <ResizablePanel
          as="aside"
          defaultWidth={sidebarWidth}
          minWidth={sidebarMinWidth}
          maxWidth={sidebarMaxWidth}
          position={sidebarPosition}
          collapsed={sidebarCollapsed}
          onCollapseChange={handleSidebarCollapseChange}
          className={appShellStyles.sidebar}
          expandTitle="Expand"
          collapseTitle="Collapse"
        >
          {sidebar}
        </ResizablePanel>
        <div className={appShellStyles.main}>
          <div className={hideMainContent ? 'hidden' : appShellStyles.mainContent}>{children}</div>
          {showTerminal && <Terminal />}
          {statusBar}
        </div>
        {rightPanel}
      </div>
    </AppShellProvider>
  )
}
