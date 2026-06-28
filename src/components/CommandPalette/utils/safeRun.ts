/** Try a callback; swallow errors silently. Used by source action callbacks. */
export function safeRun(fn: () => void | Promise<void>): void {
  try {
    const result = fn()
    if (result && typeof (result as Promise<void>).then === 'function') {
      ;(result as Promise<void>).catch(() => {
        /* swallow */
      })
    }
  } catch {
    /* swallow */
  }
}
