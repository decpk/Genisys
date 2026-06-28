import { useEffect } from 'react'

import { parseControl } from '@/components/Messages/utils/parseControl'
import { useMessagesStore } from '@/store/messages-store'

// Subscribes to inbound app-control frames (reactions, disappearing-timer)
// and applies them to the store. Mounted once by the Messages orchestrator;
// the bridge listener is torn down on unmount.
export function useMessagesControl(): void {
  const toggleReaction = useMessagesStore((s) => s.toggleReaction)
  const setEphemeralTtl = useMessagesStore((s) => s.setEphemeralTtl)

  useEffect(() => {
    const unlisten = window.api.onMsgControl(({ peerId, payload }) => {
      const control = parseControl(payload)
      if (!control) return
      if (control.t === 'reaction') {
        toggleReaction(control.messageId, control.emoji, 'peer', control.op)
        return
      }
      if (control.t === 'ephemeral-timer') {
        setEphemeralTtl(peerId, control.ttlMs)
      }
    })
    return () => unlisten()
  }, [toggleReaction, setEphemeralTtl])
}
