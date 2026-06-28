import { useTodaysTasks, type UseTodaysTasksResult } from './useTodaysTasks'
import { useUpcomingMeetings, type UseUpcomingMeetingsResult } from './useUpcomingMeetings'
import { useAgendaActions, type UseAgendaActionsResult } from './useAgendaActions'

export interface UseTodaysAgendaTileDataResult {
  tasksData: UseTodaysTasksResult
  meetingsData: UseUpcomingMeetingsResult
  actions: UseAgendaActionsResult
}

/**
 * Orchestrator hook for the Today's Agenda tile. Composes:
 *  - `useTodaysTasks`       — today's tasks (sorted, with completion stats)
 *  - `useUpcomingMeetings`  — next N meetings with live countdown
 *  - `useAgendaActions`     — task toggle handler
 */
export function useTodaysAgendaTileData(): UseTodaysAgendaTileDataResult {
  const tasksData = useTodaysTasks()
  const meetingsData = useUpcomingMeetings()
  const actions = useAgendaActions()
  return { tasksData, meetingsData, actions }
}
