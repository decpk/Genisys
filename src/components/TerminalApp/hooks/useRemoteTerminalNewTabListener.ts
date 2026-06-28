import { useEffect } from 'react'

import {
  onRemoteNewTab,
  remoteTerminalAttachNew,
} from '@/components/Terminal/api/remote'
import { useTerminalAppStore } from '@/store/terminal-app-store'

/**
 * Bridge remote "new tab" requests into the standalone Terminal app: when an
 * approved device asks to open a tab, run the app's real `createTab` (spawn a
 * PTY + add a tab + focus it, exactly like a local Mod+T) and report the created
 * session id back so the waiting WebSocket bridge attaches the requesting client
 * to the same, now locally-visible tab. Peer of `useRemoteTerminalCloseTabListener`.
 */
export function useRemoteTerminalNewTabListener(): void {
  useEffect(() => {
    const off = onRemoteNewTab(({ requestId, cols, rows }) => {
      void (async () => {
        try {
          const sessionId = await useTerminalAppStore
            .getState()
            .createTab({ cols, rows })
          // An empty id tells the bridge creation failed so it stops waiting.
          await remoteTerminalAttachNew(requestId, sessionId ?? '')
        } catch {
          // The bridge may have already timed out and dropped the request; a
          // late resolve is harmless, so ignore any error here.
        }
      })()
    })
    return off
  }, [])
}
