/** Forcibly disconnect a connected remote client by id. */
export async function remoteTerminalDisconnect(clientId: string): Promise<boolean> {
  const res = await window.api.remoteTerminalDisconnect(clientId)
  return res?.success === true
}
