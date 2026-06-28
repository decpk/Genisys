import { useEffect } from 'react'

import { useSettingsStore } from '@/store/settings-store'
import { useQuickShareStore } from '@/store/quickshare-store'
import { useMonitorStore } from '@/store/monitor-store'
import { useRemoteTerminalStore } from '@/store/remote-terminal-store'

/**
 * Stops any user-started LAN / streaming server whose owning app has just been
 * disabled. These servers run in the Rust backend and keep serving even after
 * the app's UI unmounts, so without this a disabled app would keep accepting
 * connections on the network. Each store exposes `running` + `stop()`, and
 * `stop()` is a safe no-op when the server isn't running.
 *
 * Mounted once at the app shell so it observes every `enabledApps` change.
 */
export function useDisabledAppCleanup(): void {
  const enabledApps = useSettingsStore((s) => s.enabledApps)

  useEffect(() => {
    const enabled = new Set(enabledApps)

    // QuickShare — LAN file/text drop hub.
    if (!enabled.has('quickshare') && useQuickShareStore.getState().running) {
      void useQuickShareStore.getState().stop()
    }
    // Monitor — camera/mic LAN streaming server.
    if (!enabled.has('monitor') && useMonitorStore.getState().running) {
      void useMonitorStore.getState().stop()
    }
    // Remote Terminal sharing — owned by the Terminal app.
    if (!enabled.has('terminal') && useRemoteTerminalStore.getState().running) {
      void useRemoteTerminalStore.getState().stop()
    }
  }, [enabledApps])
}
