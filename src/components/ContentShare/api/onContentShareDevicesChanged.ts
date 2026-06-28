/** Subscribe to the discovered-devices list changing. Returns an unsubscribe fn. */
export function onContentShareDevicesChanged(callback: () => void): () => void {
  return window.api.onContentShareDevicesChanged(callback)
}
