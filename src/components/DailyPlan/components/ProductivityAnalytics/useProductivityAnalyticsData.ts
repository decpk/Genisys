import { useEffect, useMemo, useState } from 'react'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import { useSettingsStore } from '@/store/settings-store'
import { getToday, addDays, formatDateShort } from '../../utils/formatDate'
import { fetchAnalyticsData, type AnalyticsRawData } from './api/fetchAnalyticsData'
import { computeStreak } from './utils/computeStreak'
import { safeMeetingMinutes } from './utils/safeMeetingMinutes'
import { computePriorityBreakdown } from './utils/computePriorityBreakdown'
import { computeTaskFlowInsights } from './utils/computeTaskFlowInsights'
import { computeCompletionHeatmap } from './utils/computeCompletionHeatmap'
import { computeVelocityAndPlanning } from './utils/computeVelocityAndPlanning'
import { computeMeetingIntelligence } from './utils/computeMeetingIntelligence'
import { computeFocusTimeTrend } from './utils/computeFocusTimeTrend'
import { computeWeekdayAnalysis } from './utils/computeWeekdayAnalysis'
import type {
  DayStats,
  CategoryBreakdown,
  AnalyticsData,
} from './ProductivityAnalytics.types'

export type { DayStats, CategoryBreakdown, AnalyticsData }

export function useProductivityAnalyticsData(rangeDays = 14): AnalyticsData {
  const [apiData, setApiData] = useState<AnalyticsRawData>({ tasks: {}, meetings: {} })
  const [isLoading, setIsLoading] = useState(true)
  const categories = useDailyPlanStore((s) => s.categories)
  const storeTasks = useDailyPlanStore((s) => s.tasks)
  const storeMeetings = useDailyPlanStore((s) => s.meetings)
  const dailyEntries = useDailyPlanStore((s) => s.dailyEntries)

  const dpWorkStartTime = useSettingsStore((s) => s.dpWorkStartTime)
  const dpWorkEndTime = useSettingsStore((s) => s.dpWorkEndTime)
  const dpLunchStartTime = useSettingsStore((s) => s.dpLunchStartTime)
  const dpLunchEndTime = useSettingsStore((s) => s.dpLunchEndTime)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      const today = getToday()
      const startDate = addDays(today, -(rangeDays - 1))

      try {
        const data = await fetchAnalyticsData(startDate, today)
        if (!cancelled) setApiData(data)
      } catch {
        // If API fails, we still have store data
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [rangeDays])

  return useMemo(() => {
    const today = getToday()

    // Merge: store data (live, current session) takes priority over API data
    const merged = {
      tasks: { ...apiData.tasks } as Record<string, Record<string, unknown>[]>,
      meetings: { ...apiData.meetings } as Record<string, Record<string, unknown>[]>,
    }
    for (const [date, tasks] of Object.entries(storeTasks)) {
      if (tasks && tasks.length > 0) merged.tasks[date] = tasks as unknown as Record<string, unknown>[]
    }
    for (const [date, meetings] of Object.entries(storeMeetings)) {
      if (meetings && meetings.length > 0) merged.meetings[date] = meetings as unknown as Record<string, unknown>[]
    }

    // ── Build day stats ──
    const days: DayStats[] = []
    const datesInRange: string[] = []

    for (let i = -(rangeDays - 1); i <= 0; i++) {
      const date = addDays(today, i)
      datesInRange.push(date)
      const dateTasks = merged.tasks[date] || []
      const dateMeetings = merged.meetings[date] || []
      const completed = dateTasks.filter((t) => (t as any).status === 'completed').length
      const total = dateTasks.length

      days.push({
        date,
        label: formatDateShort(date),
        totalTasks: total,
        completedTasks: completed,
        completionPct: total > 0 ? Math.round((completed / total) * 100) : 0,
        meetingCount: dateMeetings.length,
        meetingMinutes: dateMeetings.reduce((acc: number, m) => acc + safeMeetingMinutes(m), 0),
      })
    }

    // ── Existing aggregates ──
    const totalTasks = days.reduce((s, d) => s + d.totalTasks, 0)
    const totalCompleted = days.reduce((s, d) => s + d.completedTasks, 0)
    const totalMeetings = days.reduce((s, d) => s + d.meetingCount, 0)
    const totalMeetingMinutes = days.reduce((s, d) => s + d.meetingMinutes, 0)
    const { current, best } = computeStreak(days)

    // ── Category breakdown ──
    const allTasks = Object.values(merged.tasks).flat()
    const allMeetings = Object.values(merged.meetings).flat()
    const catMap = new Map<string | null, { count: number; completed: number }>()
    for (const t of allTasks) {
      const key = (t as any).categoryId ?? null
      const entry = catMap.get(key) || { count: 0, completed: 0 }
      entry.count++
      if ((t as any).status === 'completed') entry.completed++
      catMap.set(key, entry)
    }

    const categoryBreakdown: CategoryBreakdown[] = []
    for (const [catId, stats] of catMap) {
      const cat = categories.find((c) => c.id === catId)
      categoryBreakdown.push({
        categoryId: catId,
        name: cat?.name || 'Uncategorized',
        color: cat?.color || '#6b7280',
        count: stats.count,
        completed: stats.completed,
      })
    }
    categoryBreakdown.sort((a, b) => b.count - a.count)

    // ── NEW: Priority breakdown ──
    const priorityBreakdown = computePriorityBreakdown(allTasks)

    // ── NEW: Task flow & attention insights ──
    const taskFlowInsights = computeTaskFlowInsights(allTasks, today)

    // ── NEW: Completion heatmap ──
    const completionHeatmap = computeCompletionHeatmap(allTasks)

    // ── NEW: Velocity & planning ──
    const { avgVelocityHours, planningScore } = computeVelocityAndPlanning(allTasks)

    // ── NEW: Meeting intelligence ──
    const globalDefaults = {
      workStartTime: dpWorkStartTime,
      workEndTime: dpWorkEndTime,
      lunchStartTime: dpLunchStartTime,
      lunchEndTime: dpLunchEndTime,
    }

    // Calculate total work minutes in range for meeting load
    let totalWorkMinutesInRange = 0
    for (const date of datesInRange) {
      const entry = dailyEntries[date]
      const ws = entry?.workStartTime ?? dpWorkStartTime
      const we = entry?.workEndTime ?? dpWorkEndTime
      if (ws && we) {
        const [sh, sm] = ws.split(':').map(Number)
        const [eh, em] = we.split(':').map(Number)
        const ls = entry?.lunchStartTime ?? dpLunchStartTime
        const le = entry?.lunchEndTime ?? dpLunchEndTime
        let lunchMins = 0
        if (ls && le) {
          const [lsh, lsm] = ls.split(':').map(Number)
          const [leh, lem] = le.split(':').map(Number)
          lunchMins = (leh * 60 + lem) - (lsh * 60 + lsm)
        }
        totalWorkMinutesInRange += Math.max((eh * 60 + em) - (sh * 60 + sm) - lunchMins, 0)
      }
    }

    const meetingIntel = computeMeetingIntelligence(allMeetings, totalWorkMinutesInRange)

    // ── NEW: Focus time trend ──
    const focusResult = computeFocusTimeTrend(
      datesInRange,
      merged.meetings,
      dailyEntries,
      globalDefaults,
    )

    // ── NEW: Weekday analysis ──
    const weekdayAnalysis = computeWeekdayAnalysis(merged.tasks)

    return {
      // Existing
      days,
      totalTasks,
      totalCompleted,
      overallCompletionPct: totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0,
      totalMeetings,
      totalMeetingMinutes,
      currentStreak: current,
      bestStreak: best,
      categoryBreakdown,
      isLoading,

      // New — Phase 1
      priorityBreakdown,
      completionHeatmap,
      avgVelocityHours,
      planningScore,
      taskFlowInsights,

      // New — Phase 2
      meetingTypeDistribution: meetingIntel.meetingTypeDistribution,
      meetingCancelRate: meetingIntel.meetingCancelRate,
      avgMeetingDuration: meetingIntel.avgMeetingDuration,
      meetingLoadPct: meetingIntel.meetingLoadPct,

      // New — Phase 3
      focusTimeTrend: focusResult.trend,
      avgFocusMinutes: focusResult.avgFocusMinutes,
      weekdayAnalysis,
    }
  }, [apiData, storeTasks, storeMeetings, rangeDays, categories, isLoading, dailyEntries, dpWorkStartTime, dpWorkEndTime, dpLunchStartTime, dpLunchEndTime])
}
