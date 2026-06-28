import { useMemo } from 'react'

import { useDailyPlanStore } from '@/store/daily-plan-store'

import { getAgendaPills } from '../utils/getAgendaPills'
import { getDayProgress } from '../utils/getDayProgress'
import { getTodayKey } from '../utils/getTodayKey'

import type { ClockBriefingBottomData } from './ClockBriefingBottom.types'
import { buildEmptyLine } from './utils/buildEmptyLine'
import { buildSummaryLine } from './utils/buildSummaryLine'

export function useClockBriefingBottomData(now: Date): ClockBriefingBottomData {
  const todayKey = getTodayKey(now)
  const tasks = useDailyPlanStore((s) => s.tasks[todayKey])
  const meetings = useDailyPlanStore((s) => s.meetings[todayKey])

  return useMemo<ClockBriefingBottomData>(() => {
    const agenda = getAgendaPills({ now, tasks, meetings })
    const dayProgress = getDayProgress(now)
    const completedTasks = (tasks ?? []).filter((t) => t.status === 'completed').length
    const completedMeetings = (meetings ?? []).filter((m) => m.status === 'completed').length
    const totalDone = completedTasks + completedMeetings
    const summaryLine = buildSummaryLine(
      agenda.totalTasks,
      agenda.totalMeetings,
      dayProgress.percent,
    )
    const emptyLine = buildEmptyLine(agenda, totalDone)

    return {
      pills: agenda.pills,
      isEmpty: agenda.isEmpty,
      isWrapped: agenda.isWrapped,
      totalTasks: agenda.totalTasks,
      totalMeetings: agenda.totalMeetings,
      totalDone,
      dayPercent: dayProgress.percent,
      dayRatio: dayProgress.ratio,
      summaryLine,
      emptyLine,
    }
  }, [now, tasks, meetings])
}
