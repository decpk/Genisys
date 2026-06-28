import type { DPTask } from '@/components/DailyPlan/DailyPlan.types'
import { generateId } from '@/components/DailyPlan/utils/generateId'

import { getTodayStr } from './getTodayStr'

/**
 * Build a fresh `DPTask` for a quick inline add from the Today's Agenda tile.
 *
 * Mirrors the default field set used by the full `TaskDialog`:
 *   - scheduled for today, untimed
 *   - `todo` status, `medium` priority, no category
 *   - 30-minute default duration, no reminder
 *
 * Pure function — caller is responsible for trimming / non-empty validation
 * and for persisting via the store's `saveTask`.
 */
export function buildNewAgendaTask(title: string): DPTask {
  const now = new Date().toISOString()
  return {
    id: generateId('task'),
    title: title.trim(),
    description: '',
    status: 'todo',
    priority: 'medium',
    categoryId: null,
    scheduledDate: getTodayStr(),
    scheduledTime: null,
    durationMinutes: 30,
    reminderAt: null,
    sortOrder: 0,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  }
}
