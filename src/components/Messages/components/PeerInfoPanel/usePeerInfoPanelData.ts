import { useCallback, useState } from 'react'

import { verifyPeer } from '@/components/Messages/api/verifyPeer'
import { formatFingerprint } from '@/components/Messages/utils/formatFingerprint'
import { formatSafetyNumber } from '@/components/Messages/utils/formatSafetyNumber'
import { useMessagesStore } from '@/store/messages-store'

import type { PeerInfoPanelData } from './PeerInfoPanel.types'

export function usePeerInfoPanelData(): PeerInfoPanelData {
  const activePeerId = useMessagesStore((s) => s.activePeerId)
  const connectedPeers = useMessagesStore((s) => s.connectedPeers)
  const upsertPeer = useMessagesStore((s) => s.upsertPeer)

  const [isVerifying, setIsVerifying] = useState(false)

  let peer = null
  if (activePeerId) peer = connectedPeers[activePeerId] ?? null

  const fingerprint = formatFingerprint(peer?.publicKey ?? '')
  let safetyNumber: string | null = null
  if (peer?.safetyNumber) safetyNumber = formatSafetyNumber(peer.safetyNumber)

  const handleVerify = useCallback(async () => {
    if (!peer) return
    setIsVerifying(true)
    try {
      const updated = await verifyPeer(peer.id)
      upsertPeer(updated)
    } catch (e) {
      console.error('[messages] failed to verify peer:', e)
    } finally {
      setIsVerifying(false)
    }
  }, [peer, upsertPeer])

  return { peer, isVerifying, fingerprint, safetyNumber, handleVerify }
}
