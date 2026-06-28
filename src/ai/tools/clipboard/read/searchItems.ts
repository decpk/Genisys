import { formatEntityToken } from '@/ai/entity-links'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'clipboard_search_items',
  definition: {
    type: 'function',
    function: {
      name: 'clipboard_search_items',
      description:
        'Search clipboard items using fuzzy matching. Returns a markdown table where the Preview column contains entity-link tokens of the form [[entity:clipboard:<id>|<preview>]]. CRITICAL: when relaying these results to the user, copy each token verbatim and never replace it with raw text or the bare ID — the tokens render as clickable chips that open the item.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query to find in clipboard items.',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results to return. Defaults to 20.',
          },
        },
        required: ['query'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const query = args.query as string
    if (!query?.trim()) {
      return { kind: 'error', message: 'Search query is required.' }
    }

    const limit = (args.limit as number) || 20

    try {
      const result = await window.api.loadClipboardItems({
        limit,
        search: query.trim(),
        fuzzy: true,
      })

      const items = result.items as Array<{
        id: string
        contentType: string
        textContent: string | null
        isPinned: boolean
        createdAt: string
        byteSize: number
        labels: Array<{ id: string; name: string }>
        imageDescription: string | null
      }>

      if (items.length === 0) {
        return { kind: 'success', message: `No results found for "${query}".` }
      }

      const lines = items.map((item, i) => {
        const type = item.contentType === 'text' ? '📝' : '🖼️'
        const preview =
          item.contentType === 'text'
            ? (item.textContent?.slice(0, 80)?.replace(/\n/g, ' ') ?? '(empty)')
            : (item.imageDescription ?? '(no description)')
        const previewCell = formatEntityToken('clipboard', item.id, preview)
        return `| ${i + 1} | ${type} | ${previewCell} | ${item.id} |`
      })

      const message = [
        `**Search Results for "${query}"** (${items.length} found)`,
        '',
        '| # | Type | Preview | ID |',
        '|---|------|---------|-----|',
        ...lines,
      ].join('\n')

      return { kind: 'success', message }
    } catch (e) {
      return { kind: 'error', message: `Search failed: ${e instanceof Error ? e.message : String(e)}` }
    }
  },
}

export default tool
