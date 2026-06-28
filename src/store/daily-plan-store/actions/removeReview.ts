type Get = () => any
type Set = (partial: any) => void

export async function removeReviewAction(get: Get, set: Set, id: string, date: string): Promise<void> {
  try {
    await (window as any).api.dpRemoveReview(id)

    const state = get()
    const reviews = { ...state.reviews }
    if (reviews[date]) {
      reviews[date] = reviews[date].filter((r: any) => r.id !== id)
    }

    set({ reviews })
  } catch (err) {
    console.error('Failed to remove review:', err)
  }
}
