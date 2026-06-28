import { useCallback, useState } from 'react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('settings')

import { clearUsageData } from '@/lib/usage'

export interface UseClearUsageResult {
  clearing: boolean
  clear: () => void
}

/**
 * Clears all stored usage data, then triggers a reload of the stats and
 * shows a confirmation toast.
 */
export function useClearUsage(reload: () => void): UseClearUsageResult {
  const [clearing, setClearing] = useState(false)

  const clear = useCallback(() => {
    setClearing(true)
    void clearUsageData()
      .then(() => {
        reload()
        toast.success('Usage data cleared')
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : 'Failed to clear usage data.'
        toast.error(message)
      })
      .finally(() => {
        setClearing(false)
      })
  }, [reload])

  return { clearing, clear }
}
