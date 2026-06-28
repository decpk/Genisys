type Get = () => any
type Set = (partial: any) => void

export async function saveReviewAction(get: Get, set: Set, review: any): Promise<void> {
  try {
    await (window as any).api.dpSaveReview(review)

    const state = get()
    const reviews = { ...state.reviews }
    const date = review.scheduledDate

    // Remove review from any other date it might have been on (review moved)
    for (const key of Object.keys(reviews)) {
      if (key !== date && reviews[key]) {
        const idx = reviews[key].findIndex((r: any) => r.id === review.id)
        if (idx >= 0) {
          reviews[key] = reviews[key].filter((r: any) => r.id !== review.id)
        }
      }
    }

    // Add or update in the target date
    if (!reviews[date]) reviews[date] = []
    const existingIdx = reviews[date].findIndex((r: any) => r.id === review.id)
    if (existingIdx >= 0) {
      reviews[date] = reviews[date].map((r: any, i: number) => (i === existingIdx ? review : r))
    } else {
      reviews[date] = [...reviews[date], review]
    }

    set({ reviews })
  } catch (err) {
    console.error('Failed to save review:', err)
  }
}
