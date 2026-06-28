import { useEffect, useRef } from 'react'

import { useSettingsStore } from '@/store/settings-store'
import { useDailyPlanStore } from '@/store/daily-plan-store'

import { startReminderScheduler } from '../services/reminderScheduler'
import { getToday } from '../utils/formatDate'

/**
 * Shell-level hook that keeps the DailyPlan reminder scheduler ALWAYS-ON for
 * the lifetime of the app session — independent of whether the DailyPlan app
 * is currently mounted, hidden, or has been evicted by the keep-alive LRU.
 *
 * On first activation (DailyPlan enabled) it seeds TODAY's tasks/meetings so
 * reminders have data even if the user never opened DailyPlan, then starts the
 * module-level singleton scheduler. It deliberately never stops the scheduler:
 * reminders are notifications and must keep firing for the whole session.
 *
 * Mounted once from the app shell (`GenisysApp`), next to `useTimerTick()`.
 */
export function useDailyPlanReminders(): void {
  const enabledApps = useSettingsStore((s) => s.enabledApps)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    if (!enabledApps.includes('dailyplan')) return
    startedRef.current = true

    // Seed today's data so reminders fire even if DailyPlan was never opened
    // (or has been evicted), then start the always-on scheduler.
    void useDailyPlanStore.getState().loadDataForDate(getToday())
    startReminderScheduler()
  }, [enabledApps])
}
