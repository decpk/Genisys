type Get = () => any
type Set = (partial: any) => void

export async function loadDataForDateAction(get: Get, set: Set, date: string): Promise<void> {
  set({ isLoading: true })

  try {
    const api = (window as any).api
    const [tasks, reviews, meetings, dailyEntry, dailyStatus] = await Promise.all([
      api.dpLoadTasks(date, date),
      api.dpLoadReviews(date, date),
      api.dpLoadMeetings(date, date),
      api.dpLoadDailyEntry(date),
      api.dpLoadDailyStatus(date),
    ])

    const state = get()
    set({
      tasks: { ...state.tasks, [date]: tasks || [] },
      reviews: { ...state.reviews, [date]: reviews || [] },
      meetings: { ...state.meetings, [date]: meetings || [] },
      dailyEntries: dailyEntry
        ? { ...state.dailyEntries, [date]: dailyEntry }
        : state.dailyEntries,
      dailyStatus: dailyStatus
        ? { ...state.dailyStatus, [date]: dailyStatus }
        : state.dailyStatus,
      isLoading: false,
      isInitialized: true,
    })
  } catch (err) {
    console.error('Failed to load data for date:', date, err)
    set({ isLoading: false })
  }
}
