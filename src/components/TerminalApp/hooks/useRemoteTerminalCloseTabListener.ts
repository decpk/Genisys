import { useEffect } from 'react'

import { onRemoteCloseTab } from '@/components/Terminal/api/remote'
import { useTerminalAppStore } from '@/store/terminal-app-store'

/**
 * Bridges remote "close tab" requests to the standalone Terminal app's own
 * `closeTab`, so an approved device closing a tab in the browser removes it on
 * the desktop exactly like a local close (kill PTY + drop tab + collapse pane),
 * then the updated tab list is re-pushed to every connected device.
 *
 * The backend only emits this event for tabs the app advertises, and only when
 * the host has granted close permission — so no extra guarding is needed here.
 */
export function useRemoteTerminalCloseTabListener(): void {
  useEffect(() => {
    const off = onRemoteCloseTab(({ sessionId }) => {
      void useTerminalAppStore.getState().closeTab(sessionId)
    })
    return off
  }, [])
}
