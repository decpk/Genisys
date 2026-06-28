import { useEffect } from 'react'

import { callController } from '../call/callController'
import { parseSignal } from '../call/utils/parseSignal'

/**
 * Thin orchestrator for the call engine — mount ONCE at the Messages root.
 *
 * Subscribes incoming call signals (parsed + routed to the controller) and peer
 * disconnects (auto-end). On unmount it releases the bridge listeners and ends
 * any active call so devices are always freed. All state-machine logic lives in
 * the controller, not here.
 */
export function useCallEngine(): void {
  useEffect(() => {
    const unSignal = window.api.onMsgSignal((data) => {
      const signal = parseSignal(data.payload)
      if (signal) callController.handleSignal(data.peerId, signal)
    })
    const unPeer = window.api.onMsgPeerUpdated((peer) => {
      if (peer.status === 'disconnected') {
        callController.handlePeerDisconnected(peer.id)
      }
    })

    return () => {
      unSignal()
      unPeer()
      callController.endActive()
    }
  }, [])
}
