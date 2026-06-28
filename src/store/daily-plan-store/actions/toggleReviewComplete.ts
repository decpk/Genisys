type Get = () => any
type Set = (partial: any) => void

export async function toggleReviewCompleteAction(get: Get, set: Set, review: any): Promise<void> {
  const updatedReview = { ...review }

  if (review.status === 'completed') {
    updatedReview.status = 'todo'
    updatedReview.completedAt = null
  } else {
    updatedReview.status = 'completed'
    updatedReview.completedAt = new Date().toISOString()
  }

  try {
    await (window as any).api.dpSaveReview(updatedReview)

    const state = get()
    const reviews = { ...state.reviews }
    const date = updatedReview.scheduledDate

    if (reviews[date]) {
      const idx = reviews[date].findIndex((r: any) => r.id === updatedReview.id)
      if (idx >= 0) {
        reviews[date] = [...reviews[date]]
        reviews[date][idx] = updatedReview
      }
    }

    set({ reviews })
  } catch (err) {
    console.error('Failed to toggle review complete:', err)
  }
}
