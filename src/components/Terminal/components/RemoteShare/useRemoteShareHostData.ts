import { useEffect } from 'react'

import {
  onRemoteApprovalRequest,
  onRemoteClientsChanged,
} from '@/components/Terminal/api/remote'
import { useRemoteTerminalStore } from '@/store/remote-terminal-store'

/**
 * Wires the global remote-terminal event listeners into the store and hydrates
 * the initial status. Mounted once by `RemoteShareHost`. Returns the flags the
 * host needs to decide what to render.
 */
export function useRemoteShareHostData() {
  const panelOpen = useRemoteTerminalStore((s) => s.panelOpen)
  const hasApprovals = useRemoteTerminalStore((s) => s.pendingApprovals.length > 0)

  // Zustand setters are stable references — safe as effect deps.
  const refreshStatus = useRemoteTerminalStore((s) => s.refreshStatus)
  const setClients = useRemoteTerminalStore((s) => s.setClients)
  const addPendingApproval = useRemoteTerminalStore((s) => s.addPendingApproval)

  useEffect(() => {
    // Hydrate in case the server is already running (e.g. after a hot reload).
    void refreshStatus()

    const offApproval = onRemoteApprovalRequest((payload) => {
      addPendingApproval(payload)
    })
    const offClients = onRemoteClientsChanged((payload) => {
      setClients(payload.clients)
    })

    return () => {
      offApproval()
      offClients()
    }
  }, [refreshStatus, setClients, addPendingApproval])

  return { panelOpen, hasApprovals }
}
