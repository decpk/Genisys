import { useBindShortcutActions } from '@/frameworks/keyboard-shortcut'
import { useTerminalStore } from '@/store/terminal-store'
import { useMockServerStore } from '@/store/mock-server-store'

export function useMockServerActionsAction(): void {
  useBindShortcutActions({
    'mockserver.newEndpoint': () => {
      window.dispatchEvent(new Event('mockserver:create-endpoint'))
    },
    'mockserver.toggleTerminal': () => {
      useTerminalStore.getState().toggleOpen()
    },
    'mockserver.closeTab': () => {
      const { activeEndpointTabId, selectedEndpointId, requestCloseEndpointTab } =
        useMockServerStore.getState()

      // Target the active tab, falling back to whatever endpoint is currently
      // shown in the main panel. Opening the confirmation dialog (not closing
      // directly) — confirming stops the server (if running) and closes the tab.
      const targetId = activeEndpointTabId ?? selectedEndpointId
      if (targetId) requestCloseEndpointTab(targetId)
    },
  })
}
