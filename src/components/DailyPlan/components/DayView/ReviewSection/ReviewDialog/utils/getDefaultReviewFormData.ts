import type { DPReviewFormData } from '../../../../../DailyPlan.types'

/** Pure: returns a blank review form pre-scheduled to `selectedDate`. */
export function getDefaultReviewFormData(selectedDate: string): DPReviewFormData {
  return {
    title: '',
    description: '',
    priority: 'medium',
    reviewType: 'general',
    link: '',
    authorName: '',
    authorAvatarUrl: '',
    scheduledDate: selectedDate,
    scheduledTime: null,
    durationMinutes: 30,
    reminderAt: null,
  }
}
