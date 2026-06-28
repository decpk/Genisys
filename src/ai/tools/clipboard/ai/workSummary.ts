import { fetchAITransform } from '@/components/ClipboardManager/utils/ai-transform/api/fetchAITransform'
import { buildClipboardWorkSummarySystemPrompt } from '@/prompts/clipboardWorkSummarySystemPrompt'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'clipboard_work_summary',
  definition: {
    type: 'function',
    function: {
      name: 'clipboard_work_summary',
      description:
        'Analyze clipboard activity over a time period and generate a structured work summary. Identifies what the user worked on based on their copied content — code, messages, URLs, notes, etc. Perfect for standup updates, daily logs, or weekly reports.',
      parameters: {
        type: 'object',
        properties: {
          hours: {
            type: 'number',
            description: 'Number of hours to look back. Defaults to 8 (one workday). Use 24 for a full day, 168 for a week.',
          },
          style: {
            type: 'string',
            enum: ['standup', 'detailed', 'bullet'],
            description: 'Summary style. "standup" = concise 3-section format, "detailed" = narrative with context, "bullet" = grouped bullet points. Defaults to "standup".',
          },
        },
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const hours = Math.min(Math.max((args.hours as number) || 8, 1), 720)
    const style = (args.style as string) || 'standup'

    const cutoff = new Date()
    cutoff.setHours(cutoff.getHours() - hours)
    const cutoffISO = cutoff.toISOString()

    try {
      const result = await window.api.loadClipboardItems({ limit: 300 })
      const allItems = result.items as Array<{
        contentType: 'text' | 'image'
        textContent: string | null
        createdAt: string
        imageDescription: string | null
        labels: Array<{ name: string }>
      }>

      const items = allItems.filter((i) => i.createdAt >= cutoffISO)

      if (items.length === 0) {
        return { kind: 'success', message: `No clipboard activity in the last ${hours} hours.` }
      }

      const digest = items.map((item) => {
        const time = new Date(item.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        const content = item.contentType === 'text'
          ? (item.textContent?.slice(0, 300) ?? '')
          : `[Image: ${item.imageDescription ?? 'no description'}]`
        const labels = item.labels.length > 0 ? ` (labels: ${item.labels.map((l) => l.name).join(', ')})` : ''
        return `[${time}] ${item.contentType}${labels}: ${content}`
      }).join('\n')

      const systemPrompt = buildClipboardWorkSummarySystemPrompt(style)

      const summary = await fetchAITransform(systemPrompt, `Clipboard activity from the last ${hours} hours (${items.length} items):\n\n${digest}`)

      return { kind: 'success', message: summary }
    } catch (e) {
      return { kind: 'error', message: `Failed to generate summary: ${e instanceof Error ? e.message : String(e)}` }
    }
  },
}

export default tool
