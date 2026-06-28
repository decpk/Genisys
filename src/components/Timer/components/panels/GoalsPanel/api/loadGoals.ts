interface MaybeApi {
  loadTimerGoals?: () => Promise<{ items: unknown[] }>
}

export async function loadGoals(): Promise<unknown[]> {
  const api = (window as unknown as { api?: MaybeApi }).api
  if (typeof api?.loadTimerGoals !== 'function') return []
  try {
    const result = await api.loadTimerGoals()
    return Array.isArray(result?.items) ? result.items : []
  } catch {
    return []
  }
}
