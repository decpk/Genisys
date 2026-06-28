/** Stop sharing: disconnect all viewers and shut the server down. */
export async function monitorStop(): Promise<void> {
  await window.api.monitorStop()
}
