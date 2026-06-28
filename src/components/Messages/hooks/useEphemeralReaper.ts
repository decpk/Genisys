import { useEffect } from 'react'

import { useMessagesStore } from '@/store/messages-store'

const SWEEP_INTERVAL_MS = 1000

// Periodically sweeps expired disappearing messages out of the store. The
// store action is a no-op when nothing has expired, so the steady-state cost
// is a cheap scan once per second. Cleared on unmount.
export function useEphemeralReaper(): void {
  const removeExpiredMessages = useMessagesStore((s) => s.removeExpiredMessages)

  useEffect(() => {
    const id = window.setInterval(() => {
      removeExpiredMessages(Date.now())
    }, SWEEP_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [removeExpiredMessages])
}
