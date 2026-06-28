import { useEffect } from 'react'

import {
  onMonitorApprovalRequest,
  onMonitorClientsChanged,
} from '@/components/Monitor/api'
import { useMonitorStore } from '@/store/monitor-store'

/**
 * Wires the global Monitor event listeners into the store and hydrates the
 * initial status. Mounted once by `MonitorShareHost`.
 */
export function useMonitorShareHostData() {
  // Zustand setters are stable references — safe as effect deps.
  const refreshStatus = useMonitorStore((s) => s.refreshStatus)
  const setClients = useMonitorStore((s) => s.setClients)
  const addPendingApproval = useMonitorStore((s) => s.addPendingApproval)

  useEffect(() => {
    // Hydrate in case the server is already running (e.g. after a hot reload).
    void refreshStatus()

    const offApproval = onMonitorApprovalRequest((payload) => {
      addPendingApproval(payload)
    })
    const offClients = onMonitorClientsChanged((clients) => {
      setClients(clients)
    })

    return () => {
      offApproval()
      offClients()
    }
  }, [refreshStatus, setClients, addPendingApproval])
}
