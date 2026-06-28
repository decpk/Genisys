import { useEffect } from 'react'

import {
  onMonitorClientConnected,
  onMonitorClientDisconnected,
  onMonitorSignal,
} from '@/components/Monitor/api'

import { monitorController } from '../engine/monitorController'

/**
 * Wires the Monitor WebRTC signaling: when a viewer connects the desktop
 * creates a peer + offer; viewer answers/ICE are applied; on disconnect the peer
 * is torn down. Mounted once by the Monitor app so it is live whenever the app
 * is mounted (i.e. whenever sharing can be running).
 */
export function useMonitorSignaling(): void {
  useEffect(() => {
    const offConnected = onMonitorClientConnected(({ clientId }) => {
      void monitorController.addViewer(clientId)
    })
    const offSignal = onMonitorSignal(({ clientId, data }) => {
      void monitorController.handleSignal(clientId, data)
    })
    const offDisconnected = onMonitorClientDisconnected(({ clientId }) => {
      monitorController.removeViewer(clientId)
    })
    return () => {
      offConnected()
      offSignal()
      offDisconnected()
    }
  }, [])
}
