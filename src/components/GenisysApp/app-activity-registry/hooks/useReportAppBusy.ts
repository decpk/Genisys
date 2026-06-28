import { useEffect } from 'react'

import { setAppBusy } from '../setAppBusy'

/**
 * Report this app as busy (running a task) while `busy` is true, so the
 * keep-alive eviction logic never unmounts it mid-task. Always clears the
 * busy flag on unmount or when `busy` becomes false.
 *
 * `appId` is typically `useAppShellId()` so a component anywhere in an app's
 * subtree — main content, right panel, or sidebar — can protect its host app.
 */
export function useReportAppBusy(appId: string | null | undefined, busy: boolean): void {
  useEffect(() => {
    setAppBusy(appId, busy)
    return () => {
      setAppBusy(appId, false)
    }
  }, [appId, busy])
}
