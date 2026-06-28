/** Forcibly disconnect a connected viewer by id. */
export async function monitorDisconnect(clientId: string): Promise<boolean> {
  const res = await window.api.monitorDisconnect(clientId)
  return res?.success === true
}
