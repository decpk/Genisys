type Get = () => any
type Set = (partial: any) => void

export async function loadDataForRangeAction(
  get: Get, set: Set, startDate: string, endDate: string
): Promise<void> {
  set({ isLoading: true })

  try {
    const api = (window as any).api
    const [tasks, reviews, meetings] = await Promise.all([
      api.dpLoadTasks(startDate, endDate),
      api.dpLoadReviews(startDate, endDate),
      api.dpLoadMeetings(startDate, endDate),
    ])

    const state = get()
    const tasksByDate: Record<string, any[]> = { ...state.tasks }
    const reviewsByDate: Record<string, any[]> = { ...state.reviews }
    const meetingsByDate: Record<string, any[]> = { ...state.meetings }

    for (const task of tasks || []) {
      const d = task.scheduledDate
      if (!tasksByDate[d]) tasksByDate[d] = []
      const idx = tasksByDate[d].findIndex((t: any) => t.id === task.id)
      if (idx >= 0) tasksByDate[d][idx] = task
      else tasksByDate[d].push(task)
    }

    for (const review of reviews || []) {
      const d = review.scheduledDate
      if (!reviewsByDate[d]) reviewsByDate[d] = []
      const idx = reviewsByDate[d].findIndex((r: any) => r.id === review.id)
      if (idx >= 0) reviewsByDate[d][idx] = review
      else reviewsByDate[d].push(review)
    }

    for (const meeting of meetings || []) {
      const d = meeting.scheduledDate
      if (!meetingsByDate[d]) meetingsByDate[d] = []
      const idx = meetingsByDate[d].findIndex((m: any) => m.id === meeting.id)
      if (idx >= 0) meetingsByDate[d][idx] = meeting
      else meetingsByDate[d].push(meeting)
    }

    set({
      tasks: tasksByDate,
      reviews: reviewsByDate,
      meetings: meetingsByDate,
      isLoading: false,
      isInitialized: true,
    })
  } catch (err) {
    console.error('Failed to load data for range:', startDate, endDate, err)
    set({ isLoading: false })
  }
}
