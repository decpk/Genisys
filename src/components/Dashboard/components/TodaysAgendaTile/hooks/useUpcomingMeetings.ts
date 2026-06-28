import { useEffect, useMemo, useState } from 'react'

import { useIsAppActive } from '@/components/GenisysApp/active-app-registry'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import type { DPMeeting } from '@/components/DailyPlan/DailyPlan.types'

import { COUNTDOWN_TICK_MS, MAX_MEETINGS_VISIBLE } from '../TodaysAgendaTile.constants'
import { getTodayStr } from '../utils/getTodayStr'
import { parseTimeToMinutes } from '../utils/parseTimeToMinutes'

export interface UpcomingMeeting {
  meeting: DPMeeting
  minutesFromNow: number
}

export interface UseUpcomingMeetingsResult {
  upcoming: UpcomingMeeting[]
  totalToday: number
}

function getNowMinutes(): number {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

/**
 * Returns up to `MAX_MEETINGS_VISIBLE` upcoming meetings for today
 * (start time >= now), each annotated with a `minutesFromNow` countdown.
 *
 * The "now" cursor ticks once per minute so countdowns stay live without
 * a 60fps re-render storm. The interval is gated on `useIsAppActive('dashboard')`
 * so it only runs while the Dashboard app is active and pauses otherwise,
 * snapping the cursor forward the moment the app becomes active again.
 */
export function useUpcomingMeetings(): UseUpcomingMeetingsResult {
  const today = getTodayStr()
  const meetings = useDailyPlanStore((s) => s.meetings[today])
  const isActive = useIsAppActive('dashboard')

  const [nowMinutes, setNowMinutes] = useState<number>(getNowMinutes)

  // Coarse 60s countdown cursor — gated so it only runs while Dashboard is the
  // active app. The first fire is async (delay 0) so the cursor snaps forward on
  // (re)activation WITHOUT a synchronous setState in the effect body, then it
  // ticks at the coarse cadence.
  useEffect(() => {
    if (!isActive) return
    let id = setTimeout(function tickNow() {
      setNowMinutes(getNowMinutes())
      id = setTimeout(tickNow, COUNTDOWN_TICK_MS)
    }, 0)
    return () => clearTimeout(id)
  }, [isActive])

  return useMemo(() => {
    const list = meetings ?? []
    const annotated: UpcomingMeeting[] = []
    for (const m of list) {
      const startMin = parseTimeToMinutes(m.startTime)
      if (startMin == null) continue
      const diff = startMin - nowMinutes
      if (diff < 0) continue
      annotated.push({ meeting: m, minutesFromNow: diff })
    }
    annotated.sort((a, b) => a.minutesFromNow - b.minutesFromNow)
    return {
      upcoming: annotated.slice(0, MAX_MEETINGS_VISIBLE),
      totalToday: list.length,
    }
  }, [meetings, nowMinutes])
}
