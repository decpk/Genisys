import { useEffect } from 'react'

import { usageTracker } from '@/lib/usage'
import { getDateKey } from '@/lib/usage/utils/getDateKey'

const ROLLOVER_CHECK_MS = 60_000

/**
 * Flushes the usage tracker on two occasions:
 *  - LOCAL midnight crossings (polled every 60s) so segments don't span days
 *    in memory — `flush()` re-seeds active segments to keep tracking.
 *  - `beforeunload`, as a best-effort persist when the window is closing.
 */
export function useUsageMidnightFlush(): void {
  useEffect(() => {
    let lastDateKey = getDateKey(Date.now())

    const handle = setInterval(() => {
      const key = getDateKey(Date.now())
      if (key !== lastDateKey) {
        lastDateKey = key
        usageTracker.flush()
      }
    }, ROLLOVER_CHECK_MS)

    const onBeforeUnload = (): void => {
      usageTracker.flush()
    }
    window.addEventListener('beforeunload', onBeforeUnload)

    return () => {
      clearInterval(handle)
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [])
}
