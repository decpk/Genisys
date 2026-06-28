import { useDailyPlanStore } from '@/store/daily-plan-store'
import { generateId } from '@/components/DailyPlan/utils/generateId'
import { getToday, formatDate } from '@/components/DailyPlan/utils/formatDate'
import type { ToolModule, ToolResult } from './tools.types'
import type { DPDailyEntry } from '@/components/DailyPlan/DailyPlan.types'

const tool: ToolModule = {
  name: 'save_daily_entry',
  definition: {
    type: 'function',
    function: {
      name: 'save_daily_entry',
      description: 'Save or update the daily entry for a given date. Merges with any existing entry. Fields not provided will keep their current values.',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Date in YYYY-MM-DD format. Defaults to today.' },
          motivationalQuote: { type: 'string', description: 'A motivational quote for the day' },
          statusContent: { type: 'string', description: 'Status/summary content for the day' },
          yesterdayReview: { type: 'string', description: 'Review of what happened yesterday' },
        },
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const date = (args.date as string) || getToday()
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { kind: 'error', message: `Invalid date: "${date}". Use YYYY-MM-DD.` }
    }

    const store = useDailyPlanStore.getState()
    if (!store.dailyEntries[date]) {
      await store.loadDataForDate(date)
    }
    const existing = useDailyPlanStore.getState().dailyEntries[date]

    const now = new Date().toISOString()
    const entry: DPDailyEntry = {
      id: existing?.id || generateId("entry"),
      date,
      motivationalQuote:
        args.motivationalQuote !== undefined
          ? (args.motivationalQuote as string)
          : existing?.motivationalQuote || "",
      statusContent:
        args.statusContent !== undefined
          ? (args.statusContent as string)
          : existing?.statusContent || "",
      yesterdayReview:
        args.yesterdayReview !== undefined
          ? (args.yesterdayReview as string)
          : existing?.yesterdayReview || "",
      workStartTime: existing?.workStartTime ?? null,
      workEndTime: existing?.workEndTime ?? null,
      lunchStartTime: existing?.lunchStartTime ?? null,
      lunchEndTime: existing?.lunchEndTime ?? null,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    await store.saveDailyEntry(entry)

    // Daily status is persisted in its own table; mirror the write so the
    // Daily Status panel reflects AI-authored status content.
    if (args.statusContent !== undefined) {
      await store.saveDailyStatus(date, args.statusContent as string)
    }

    const updatedFields: string[] = []
    if (args.motivationalQuote !== undefined) updatedFields.push('motivationalQuote')
    if (args.statusContent !== undefined) updatedFields.push('statusContent')
    if (args.yesterdayReview !== undefined) updatedFields.push('yesterdayReview')

    return {
      kind: 'success',
      message: `✅ Daily entry for ${formatDate(date)} ${existing ? 'updated' : 'created'}${updatedFields.length ? `: ${updatedFields.join(', ')}` : ''}`,
    }
  },
}

export default tool
