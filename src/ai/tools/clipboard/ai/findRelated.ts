import { fetchAITransform } from '@/components/ClipboardManager/utils/ai-transform/api/fetchAITransform'
import { buildClipboardFindRelatedSystemPrompt } from '@/prompts/clipboardFindRelatedSystemPrompt'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'clipboard_find_related',
  definition: {
    type: 'function',
    function: {
      name: 'clipboard_find_related',
      description:
        'Given one clipboard item, find other items that are semantically related — not by text match, but by meaning. E.g., a code snippet and its documentation, an error message and its stack trace, a URL and notes about that page.',
      parameters: {
        type: 'object',
        properties: {
          itemId: {
            type: 'string',
            description: 'The ID of the clipboard item to find related items for.',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of related items to return. Defaults to 10.',
          },
        },
        required: ['itemId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const itemId = args.itemId as string
    if (!itemId) return { kind: 'error', message: 'itemId is required.' }

    const limit = (args.limit as number) || 10

    try {
      const result = await window.api.loadClipboardItems({ limit: 150 })
      const allItems = result.items as Array<{
        id: string
        contentType: 'text' | 'image'
        textContent: string | null
        imageDescription: string | null
        createdAt: string
        labels: Array<{ name: string }>
      }>

      const target = allItems.find((i) => i.id === itemId)
      if (!target) return { kind: 'error', message: `Item "${itemId}" not found.` }

      const targetContent = target.contentType === 'text'
        ? (target.textContent ?? '')
        : (target.imageDescription ?? '')

      if (!targetContent.trim()) return { kind: 'error', message: 'Target item has no content to match against.' }

      // Get candidate items (exclude the target itself)
      const candidates = allItems.filter((i) => i.id !== itemId && (
        (i.contentType === 'text' && i.textContent?.trim()) ||
        (i.contentType === 'image' && i.imageDescription?.trim())
      ))

      if (candidates.length === 0) {
        return { kind: 'success', message: 'No other items to compare against.' }
      }

      // Build digest for AI semantic matching
      const candidateDigest = candidates.slice(0, 80).map((item, idx) => {
        const content = item.contentType === 'text'
          ? (item.textContent?.slice(0, 200) ?? '')
          : `[Image: ${item.imageDescription ?? ''}]`
        return `${idx}: ${content}`
      }).join('\n')

      const systemPrompt = buildClipboardFindRelatedSystemPrompt(limit)

      const response = await fetchAITransform(
        systemPrompt,
        `TARGET:\n${targetContent.slice(0, 500)}\n\nCANDIDATES:\n${candidateDigest}`,
      )

      let indices: number[]
      try {
        const jsonStr = response.replace(/```json\n?|\n?```/g, '').trim()
        indices = JSON.parse(jsonStr)
        if (!Array.isArray(indices)) indices = []
      } catch {
        return { kind: 'error', message: 'AI returned invalid response. Try again.' }
      }

      const related = indices
        .filter((idx) => typeof idx === 'number' && idx >= 0 && idx < candidates.length)
        .slice(0, limit)
        .map((idx) => candidates[idx])

      if (related.length === 0) {
        return { kind: 'success', message: 'No semantically related items found.' }
      }

      const targetPreview = targetContent.slice(0, 80).replace(/\n/g, ' ')
      const parts: string[] = []
      parts.push(`**Items related to:** "${targetPreview}${targetContent.length > 80 ? '…' : ''}"`)
      parts.push('')

      for (const [i, item] of related.entries()) {
        const content = item.contentType === 'text'
          ? (item.textContent?.slice(0, 100)?.replace(/\n/g, ' ') ?? '')
          : `[Image: ${item.imageDescription ?? ''}]`
        const type = item.contentType === 'text' ? '📝' : '🖼️'
        const labels = item.labels.length > 0 ? ` [${item.labels.map((l) => l.name).join(', ')}]` : ''
        parts.push(`${i + 1}. ${type} ${content}${labels}`)
        parts.push(`   ID: ${item.id}`)
      }

      return { kind: 'success', message: parts.join('\n') }
    } catch (e) {
      return { kind: 'error', message: `Failed to find related items: ${e instanceof Error ? e.message : String(e)}` }
    }
  },
}

export default tool
