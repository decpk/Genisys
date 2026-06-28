type Get = () => any
type Set = (partial: any) => void

export async function saveDailyStatusAction(
  get: Get,
  set: Set,
  date: string,
  content: string,
): Promise<void> {
  const state = get()
  const existing = state.dailyStatus[date]
  const now = new Date().toISOString()

  const status = {
    date,
    content,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }

  try {
    await (window as any).api.dpSaveDailyStatus(status)
    const next = get()
    set({ dailyStatus: { ...next.dailyStatus, [date]: status } })
  } catch (err) {
    console.error('Failed to save daily status:', err)
  }
}
