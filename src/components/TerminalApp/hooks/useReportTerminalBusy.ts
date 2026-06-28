import { useReportAppBusy } from '@/components/GenisysApp/app-activity-registry'
import { useTerminalAppStore } from '@/store/terminal-app-store'
import { collectTabs } from '@/store/terminal-app-store/treeUtils'

/**
 * Protects the Terminal app from keep-alive LRU eviction while it has live
 * shells running. The app is reported busy whenever ANY non-exited session
 * exists, so switching apps never auto-closes a terminal mid-task. It only
 * becomes evictable when empty (all tabs closed / exited) — which is harmless
 * and restored on next open. The selector returns a boolean primitive to keep
 * the store snapshot stable.
 */
export function useReportTerminalBusy(): void {
  const hasLiveSession = useTerminalAppStore((s) =>
    collectTabs(s.tree).some((t) => !t.exited),
  )
  useReportAppBusy('terminal', hasLiveSession)
}
