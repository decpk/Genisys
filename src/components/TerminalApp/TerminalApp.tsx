import '@xterm/xterm/css/xterm.css'

import { useTerminalEventBridge } from '@/components/Terminal/hooks/useTerminalEventBridge'
import { RemoteShareHost } from '@/components/Terminal/components/RemoteShare'
import { useTerminalAppStore } from '@/store/terminal-app-store'

import { TerminalAppDndContext } from './components/TerminalAppDnd/TerminalAppDndContext'
import { TerminalAppGroup } from './components/TerminalAppGroup/TerminalAppGroup'
import { TerminalRenameDialog } from './components/TerminalRenameDialog'
import { useConsumePendingTerminalCommand } from './hooks/useConsumePendingTerminalCommand'
import { useRemoteTerminalCloseTabListener } from './hooks/useRemoteTerminalCloseTabListener'
import { useRemoteTerminalNewTabListener } from './hooks/useRemoteTerminalNewTabListener'
import { useRemoteTerminalTabsSync } from './hooks/useRemoteTerminalTabsSync'
import { useReportTerminalBusy } from './hooks/useReportTerminalBusy'
import { useTerminalAppPersistence } from './hooks/useTerminalAppPersistence'
import { useTerminalAppRestore } from './hooks/useTerminalAppRestore'
import { useTerminalAppSurfaceGc } from './hooks/useTerminalAppSurfaceGc'
import { useTerminalHistoryLoad } from './hooks/useTerminalHistoryLoad'
import { useTerminalRemoteSizeSync } from './hooks/useTerminalRemoteSizeSync'
import { useTerminalSessionCapture } from './hooks/useTerminalSessionCapture'
import { terminalAppStyles } from './TerminalApp.styles'

/**
 * Standalone, tabbed Terminal app with split panes. Reuses the shared PTY
 * backend + `terminalOutputBus` for per-session output isolation; manages its
 * own split-tree, session restore, and keep-alive protection.
 */
export function TerminalApp() {
  // Ensure the global PTY event bridge is active while this app is mounted
  // (ref-counted, so it coexists with the docked terminal's bridge).
  useTerminalEventBridge()
  // Restore must run before persistence so a half-rebuilt tree never saves.
  useTerminalAppRestore()
  useTerminalAppPersistence()
  useTerminalSessionCapture()
  useRemoteTerminalTabsSync()
  useRemoteTerminalCloseTabListener()
  useRemoteTerminalNewTabListener()
  useTerminalRemoteSizeSync()
  useTerminalAppSurfaceGc()
  useReportTerminalBusy()
  useConsumePendingTerminalCommand()
  useTerminalHistoryLoad()

  const tree = useTerminalAppStore((s) => s.tree)

  return (
    <div className={terminalAppStyles.shell}>
      <div className={terminalAppStyles.root} data-terminal-app>
        <div className={terminalAppStyles.groupArea}>
          <TerminalAppDndContext>
            <TerminalAppGroup node={tree} />
          </TerminalAppDndContext>
        </div>
        <RemoteShareHost />
        <TerminalRenameDialog />
      </div>
    </div>
  )
}
