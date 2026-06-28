import { useEffect } from 'react'

import { getIdentity } from '@/components/Messages/api/getIdentity'
import { getPeers } from '@/components/Messages/api/getPeers'
import { startMessaging } from '@/components/Messages/api/startMessaging'
import { useMessagesStore } from '@/store/messages-store'

// On a cold start the OS networking stack may not be ready yet, so the backend
// can't resolve the LAN IP on the first identity snapshot (address shows as
// "unavailable"). Poll the identity a few times until the IP appears. This runs
// in both online and offline mode — offline still surfaces the local IP, it
// just has no listening port.
const ADDRESS_POLL_INTERVAL_MS = 1500
const ADDRESS_POLL_MAX_ATTEMPTS = 10

// Boot the local identity + LAN discovery and seed the store with an initial
// peer snapshot. On unmount everything is cleared (state is ephemeral).
export function useMessagesBoot(): { isStarted: boolean } {
  const isStarted = useMessagesStore((s) => s.isStarted)
  const setIdentity = useMessagesStore((s) => s.setIdentity)
  const setStarted = useMessagesStore((s) => s.setStarted)
  const upsertPeer = useMessagesStore((s) => s.upsertPeer)
  const upsertDiscoveredPeer = useMessagesStore((s) => s.upsertDiscoveredPeer)
  const clearAll = useMessagesStore((s) => s.clearAll)

  useEffect(() => {
    let cancelled = false
    let pollTimer: ReturnType<typeof setTimeout> | undefined

    // Re-fetch the identity until the LAN IP resolves (or attempts run out).
    // Runs in both modes — once `localIp` is present we stop.
    function scheduleAddressPoll(attempt: number): void {
      if (cancelled || attempt > ADDRESS_POLL_MAX_ATTEMPTS) return
      pollTimer = setTimeout(() => {
        void (async () => {
          try {
            const next = await getIdentity()
            if (cancelled) return
            setIdentity(next)
            if (next.localIp) return
            scheduleAddressPoll(attempt + 1)
          } catch (e) {
            if (cancelled) return
            console.error('[messages] failed to poll identity:', e)
            scheduleAddressPoll(attempt + 1)
          }
        })()
      }, ADDRESS_POLL_INTERVAL_MS)
    }

    async function boot(): Promise<void> {
      try {
        const identity = await startMessaging()
        if (cancelled) return
        setIdentity(identity)
        setStarted(true)

        // Address not yet available on a cold start — poll until it resolves.
        if (!identity.localIp) {
          scheduleAddressPoll(1)
        }

        const peers = await getPeers()
        if (cancelled) return
        peers.forEach((peer) => {
          if (peer.status === 'discovered') upsertDiscoveredPeer(peer)
          else upsertPeer(peer)
        })
      } catch (e) {
        console.error('[messages] failed to start messaging:', e)
      }
    }

    void boot()

    return () => {
      cancelled = true
      if (pollTimer) clearTimeout(pollTimer)
      clearAll()
    }
  }, [setIdentity, setStarted, upsertPeer, upsertDiscoveredPeer, clearAll])

  return { isStarted }
}
