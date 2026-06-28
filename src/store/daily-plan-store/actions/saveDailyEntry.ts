type Get = () => any
type Set = (partial: any) => void

export async function saveDailyEntryAction(get: Get, set: Set, entry: any): Promise<void> {
  try {
    await (window as any).api.dpSaveDailyEntry(entry)

    const state = get()
    set({
      dailyEntries: { ...state.dailyEntries, [entry.date]: entry },
    })
  } catch (err) {
    console.error('Failed to save daily entry:', err)
  }
}
