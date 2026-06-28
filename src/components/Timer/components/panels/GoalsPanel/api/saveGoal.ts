interface MaybeApi {
  saveTimerGoal?: (goal: unknown) => Promise<unknown>
}

export async function saveGoal(goal: unknown): Promise<void> {
  const api = (window as unknown as { api?: MaybeApi }).api
  if (typeof api?.saveTimerGoal !== 'function') return
  try {
    await api.saveTimerGoal(goal)
  } catch {
    /* noop */
  }
}
