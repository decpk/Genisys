import { useDailyPlanStore } from '@/store/daily-plan-store'
import { formatDate, getToday } from '@/components/DailyPlan/utils/formatDate'
import type { ToolModule, ToolResult } from './tools.types'
import type { DPDailyEntry } from '@/components/DailyPlan/DailyPlan.types'

const tool: ToolModule = {
  name: 'get_daily_entry',
  definition: {
    type: 'function',
    function: {
      name: 'get_daily_entry',
      description: 'Get the daily entry for a specific date. Returns the motivational quote, status content, and yesterday review. If no date is provided, returns the entry for today.',
      parameters: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
            description: 'Date in YYYY-MM-DD format. Defaults to today if not provided.',
          },
        },
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const date = (args.date as string) || getToday()
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { kind: 'error', message: `Invalid date format: "${date}". Use YYYY-MM-DD.` }
    }
    const store = useDailyPlanStore.getState()
    if (!store.dailyEntries[date]) {
      await store.loadDataForDate(date)
    }
    const state = useDailyPlanStore.getState()
    const entry: DPDailyEntry | undefined = state.dailyEntries[date]
    const statusContent: string = state.dailyStatus[date]?.content || ''
    if (!entry && !statusContent) {
      return { kind: 'success', message: `No daily entry for ${formatDate(date)}.` }
    }
    const parts: string[] = [`**Daily Entry for ${formatDate(date)}**`, '']
    if (entry?.motivationalQuote) {
      parts.push(`**Motivational Quote:** ${entry.motivationalQuote}`, '')
    }
    if (statusContent) {
      parts.push(`**Status:** ${statusContent}`, '')
    }
    if (entry?.yesterdayReview) {
      parts.push(`**Yesterday Review:** ${entry.yesterdayReview}`, '')
    }
    if (parts.length === 2) {
      parts.push('Entry exists but all fields are empty.')
    }
    return { kind: 'success', message: parts.join('\n') }
  },
}

export default tool
