import { useCallback } from 'react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('messages')

import { sendControl } from '@/components/Messages/api/sendControl'
import { useMessagesStore } from '@/store/messages-store'

import { EPHEMERAL_TTL_OPTIONS } from './EphemeralTimerPicker.constants'

// Smart layer for the disappearing-message timer: reads the active TTL for
// the peer and applies a chosen TTL both locally and to the peer over the
// encrypted control channel.
export function useEphemeralTimerPickerData(peerId: string) {
  const activeTtl = useMessagesStore((s) => s.ephemeralTtlByPeer[peerId] ?? 0)
  const setEphemeralTtl = useMessagesStore((s) => s.setEphemeralTtl)

  const selectTtl = useCallback(
    (ttlMs: number) => {
      if (ttlMs === activeTtl) return
      setEphemeralTtl(peerId, ttlMs)
      void sendControl(peerId, { t: 'ephemeral-timer', ttlMs }).catch(() => undefined)
      const option = EPHEMERAL_TTL_OPTIONS.find((o) => o.ms === ttlMs)
      if (ttlMs > 0 && option) {
        toast.info(`Disappearing messages set to ${option.label}`)
      } else {
        toast.info('Disappearing messages turned off')
      }
    },
    [peerId, activeTtl, setEphemeralTtl]
  )

  return { activeTtl, isActive: activeTtl > 0, selectTtl }
}
