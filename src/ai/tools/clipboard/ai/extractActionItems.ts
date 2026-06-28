import { fetchAITransform } from '@/components/ClipboardManager/utils/ai-transform/api/fetchAITransform'
import { clipboardExtractActionItemsSystemPrompt } from '@/prompts/clipboardExtractActionItemsSystemPrompt'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'clipboard_extract_action_items',
  definition: {
    type: 'function',
    function: {
      name: 'clipboard_extract_action_items',
      description:
        'Scan clipboard items for hidden action items, TODOs, follow-ups, deadlines, commitments, and tasks that the user may have forgotten about. Analyzes messages, notes, meeting content, and code comments to surface what needs to be done.',
      parameters: {
        type: 'object',
        properties: {
          hours: {
            type: 'number',
            description: 'Look back this many hours. Defaults to 24.',
          },
        },
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const hours = Math.min(Math.max((args.hours as number) || 24, 1), 720)

    const cutoff = new Date()
    cutoff.setHours(cutoff.getHours() - hours)
    const cutoffISO = cutoff.toISOString()

    try {
      const result = await window.api.loadClipboardItems({ limit: 200 })
      const allItems = result.items as Array<{
        id: string
        contentType: 'text' | 'image'
        textContent: string | null
        createdAt: string
        imageDescription: string | null
      }>

      const items = allItems.filter(
        (i) => i.createdAt >= cutoffISO && i.contentType === 'text' && i.textContent?.trim(),
      )

      if (items.length === 0) {
        return { kind: 'success', message: `No text items in the last ${hours} hours to scan.` }
      }

      const digest = items.map((item, idx) => {
        const time = new Date(item.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        return `[${time}] (ID: ${item.id})\n${item.textContent!.slice(0, 500)}`
      }).join('\n\n---\n\n')

      const extracted = await fetchAITransform(
        clipboardExtractActionItemsSystemPrompt,
        `Scan these ${items.length} clipboard items from the last ${hours} hours for action items:\n\n${digest}`,
      )

      return { kind: 'success', message: extracted }
    } catch (e) {
      return { kind: 'error', message: `Extraction failed: ${e instanceof Error ? e.message : String(e)}` }
    }
  },
}

export default tool
