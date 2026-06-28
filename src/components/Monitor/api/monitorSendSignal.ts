import type { MonitorSignal } from './types'

/** Relay a WebRTC signaling payload (offer / ICE candidate) from the desktop to
 *  one specific connected viewer. */
export async function monitorSendSignal(
  clientId: string,
  data: MonitorSignal,
): Promise<void> {
  await window.api.monitorSendSignal(clientId, data)
}
