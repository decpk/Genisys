import { useEffect, useRef, useState } from 'react'
import { useIsAppActive } from '@/components/GenisysApp/active-app-registry'
import { getCurrentTime24 } from '../../utils/formatTime'

const START_HOUR = 0
const END_HOUR = 23
const HOUR_HEIGHT = 60

function getTopOffset(time24: string): number {
  const [hourStr, minuteStr] = time24.split(':')
  const hour = parseInt(hourStr, 10)
  const minute = parseInt(minuteStr ?? '0', 10)
  return (hour - START_HOUR) * HOUR_HEIGHT + (minute / 60) * HOUR_HEIGHT
}

interface HourlyTimelineDataReturn {
  currentTime: string
  currentLineTop: number
  currentTimeRef: React.RefObject<HTMLDivElement | null>
}

export function useHourlyTimelineData(): HourlyTimelineDataReturn {
  const [currentTime, setCurrentTime] = useState(getCurrentTime24())
  const currentTimeRef = useRef<HTMLDivElement>(null)
  const isActive = useIsAppActive('dailyplan')

  useEffect(() => {
    if (!isActive) return
    // First fire is async (delay 0) so the "now" line snaps to the correct
    // position the moment DailyPlan becomes active again, without a synchronous
    // setState in the effect body, then resumes the 60s tick.
    let id = setTimeout(function tickNow() {
      setCurrentTime(getCurrentTime24())
      id = setTimeout(tickNow, 60_000)
    }, 0)
    return () => clearTimeout(id)
  }, [isActive])

  useEffect(() => {
    currentTimeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  const currentLineTop = getTopOffset(currentTime)

  return { currentTime, currentLineTop, currentTimeRef }
}
