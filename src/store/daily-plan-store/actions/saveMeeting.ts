type Get = () => any
type Set = (partial: any) => void

export async function saveMeetingAction(get: Get, set: Set, meeting: any): Promise<void> {
  try {
    await (window as any).api.dpSaveMeeting(meeting)

    const state = get()
    const meetings = { ...state.meetings }
    const date = meeting.scheduledDate

    // Remove meeting from any other date it might have been on (meeting moved)
    for (const key of Object.keys(meetings)) {
      if (key !== date && meetings[key]) {
        const idx = meetings[key].findIndex((m: any) => m.id === meeting.id)
        if (idx >= 0) {
          meetings[key] = meetings[key].filter((m: any) => m.id !== meeting.id)
        }
      }
    }

    if (!meetings[date]) meetings[date] = []
    const existingIdx = meetings[date].findIndex((m: any) => m.id === meeting.id)
    if (existingIdx >= 0) {
      meetings[date] = [...meetings[date]]
      meetings[date][existingIdx] = meeting
    } else {
      meetings[date] = [...meetings[date], meeting]
    }

    set({ meetings })
  } catch (err) {
    console.error('Failed to save meeting:', err)
  }
}
