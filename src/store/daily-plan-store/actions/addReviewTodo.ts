import type { DPReview } from '@/components/DailyPlan/DailyPlan.types'
import { generateId } from '@/components/DailyPlan/utils/generateId'

type Get = () => {
  reviews: Record<string, DPReview[]>
  saveReview: (review: DPReview) => Promise<void>
}

export interface AddReviewTodoInput {
  title: string
  description: string
  link: string
}

// Today as YYYY-MM-DD (matches the store's selectedDate format).
function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Create a "todo" review card for a pull request (reviewType `pr`) on today's
 * date and persist it through the normal `saveReview` path. Used to surface a
 * freshly auto-reviewed PR in Daily Plan with its TL;DR as the description.
 */
export async function addReviewTodoAction(get: Get, input: AddReviewTodoInput): Promise<void> {
  const date = todayStr()
  const now = new Date().toISOString()
  const existing = get().reviews[date] ?? []

  const review: DPReview = {
    id: generateId('review'),
    title: input.title,
    description: input.description,
    status: 'todo',
    priority: 'medium',
    reviewType: 'pr',
    link: input.link,
    scheduledDate: date,
    scheduledTime: null,
    durationMinutes: 30,
    reminderAt: null,
    sortOrder: existing.length,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  }

  await get().saveReview(review)
}
