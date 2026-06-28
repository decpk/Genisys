import { useEffect } from 'react'

import { usageTracker } from '@/lib/usage'
import { isWindowFocused, subscribeWindowFocus } from '@/hooks/useWindowFocus'

/**
 * Pauses the foreground usage segment while the window is blurred and resumes
 * it when focus returns.
 *
 * Subscribes to focus changes IMPERATIVELY (not via `useWindowFocus`) so that
 * window focus/blur never re-renders the app shell this hook is mounted in —
 * the tracker must have zero impact on app render performance.
 */
export function useUsageFocusSync(): void {
  useEffect(() => {
    const sync = (): void => {
      if (isWindowFocused()) {
        usageTracker.onWindowFocus()
      } else {
        usageTracker.onWindowBlur()
      }
    }
    sync()
    return subscribeWindowFocus(sync)
  }, [])
}
