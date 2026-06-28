/** Stop sharing and disconnect every device. No-op when not running. */
export async function quickShareStop(): Promise<void> {
  await window.api.quickShareStop()
}
