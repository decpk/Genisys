/** Stop the Content Share service. No-op when not running. */
export async function contentShareStop(): Promise<void> {
  await window.api.contentShareStop()
}
