interface MaybeApi {
  removeTimerSession?: (id: string) => Promise<unknown>
}

export async function removeHistorySession(id: string): Promise<void> {
  const api = (window as unknown as { api?: MaybeApi }).api
  if (typeof api?.removeTimerSession !== 'function') return
  try {
    await api.removeTimerSession(id)
  } catch {
    /* noop */
  }
}
