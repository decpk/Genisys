type Get = () => any
type Set = (partial: any) => void

export async function removeMeetingAction(get: Get, set: Set, id: string, date: string): Promise<void> {
  try {
    await (window as any).api.dpRemoveMeeting(id)

    const state = get()
    const meetings = { ...state.meetings }
    if (meetings[date]) {
      meetings[date] = meetings[date].filter((m: any) => m.id !== id)
    }

    set({ meetings })
  } catch (err) {
    console.error('Failed to remove meeting:', err)
  }
}
