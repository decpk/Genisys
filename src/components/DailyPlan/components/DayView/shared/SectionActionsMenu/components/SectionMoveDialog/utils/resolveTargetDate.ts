import { format } from 'date-fns'

import { getTomorrow } from '@/components/DailyPlan/utils/formatDate'

import type { MoveMode } from '../../../SectionActionsMenu.types'

/**
 * Resolve the target date string ('YYYY-MM-DD') for a given move mode.
 * - 'tomorrow' → tomorrow's date.
 * - 'pick' → the picked date formatted, or null when nothing is selected.
 * - otherwise → null.
 */
export function resolveTargetDate(mode: MoveMode | null, picked: Date | undefined): string | null {
  if (mode === 'tomorrow') {
    return getTomorrow()
  }

  if (mode === 'pick') {
    return picked ? format(picked, 'yyyy-MM-dd') : null
  }

  return null
}
