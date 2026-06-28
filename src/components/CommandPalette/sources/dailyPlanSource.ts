import { addDays, format } from 'date-fns'

import { useDailyPlanStore } from '@/store/daily-plan-store'
import { useNavigationStore } from '@/store/navigation-store'

import { safeRun } from '../utils/safeRun'
import type { PaletteItem, PaletteSource } from '../CommandPalette.types'

const WINDOW_DAYS = 30

function isoDate(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

function prettyDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'MMM d, yyyy')
  } catch {
    return dateStr
  }
}

export const dailyPlanSource: PaletteSource = {
  id: 'dailyPlan',
  kinds: ['task', 'meeting'],
  load: async () => {
    try {
      const today = new Date()
      const start = isoDate(addDays(today, -WINDOW_DAYS))
      const end = isoDate(addDays(today, WINDOW_DAYS))
      await useDailyPlanStore.getState().loadDataForRange(start, end)
    } catch {
      /* ignore */
    }
  },
  getItems(): PaletteItem[] {
    try {
      const state = useDailyPlanStore.getState() as {
        tasks?: Record<string, Array<{ id: string; title: string; date?: string }>>
        meetings?: Record<string, Array<{ id: string; title: string; date?: string; startTime?: string }>>
      }
      const items: PaletteItem[] = []

      for (const [date, list] of Object.entries(state.tasks ?? {})) {
        for (const task of list) {
          items.push({
            id: `task:${task.id}`,
            kind: "task",
            title: task.title || "Untitled task",
            subtitle: prettyDate(date),
            keywords: ["task", "todo", "daily plan", "agenda", date],
            group: "navigate",
            action: () =>
              safeRun(() =>
                useNavigationStore.getState().openDailyPlanTask(task.id),
              ),
          });
        }
      }

      for (const [date, list] of Object.entries(state.meetings ?? {})) {
        for (const meeting of list) {
          const time = meeting.startTime ? ` · ${meeting.startTime}` : ''
          items.push({
            id: `meeting:${meeting.id}`,
            kind: "meeting",
            title: meeting.title || "Untitled meeting",
            subtitle: `${prettyDate(date)}${time}`,
            keywords: [
              "meeting",
              "event",
              "calendar",
              "daily plan",
              date,
              meeting.startTime ?? "",
            ].filter(Boolean) as string[],
            group: "navigate",
            action: () =>
              safeRun(() =>
                useNavigationStore.getState().setActiveApp("dailyplan"),
              ),
          });
        }
      }

      return items
    } catch {
      return []
    }
  },
}
