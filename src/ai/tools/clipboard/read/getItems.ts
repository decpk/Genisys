import { useClipboardStore } from '@/store/clipboard-store'
import { formatEntityToken } from '@/ai/entity-links'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'clipboard_get_items',
  definition: {
    type: 'function',
    function: {
      name: 'clipboard_get_items',
      description:
        'Get clipboard items. Returns a markdown table where the Preview column contains entity-link tokens of the form [[entity:clipboard:<id>|<preview>]]. CRITICAL: when relaying these results to the user, copy each token verbatim and never replace it with raw text or the bare ID — the tokens render as clickable chips that open the item.',
      parameters: {
        type: 'object',
        properties: {
          contentType: {
            type: 'string',
            enum: ['text', 'image'],
            description: 'Filter by content type. Omit to return all types.',
          },
          search: {
            type: 'string',
            description: 'Search query to filter items by text content or image description.',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of items to return. Defaults to 50.',
          },
        },
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const contentType = args.contentType as string | undefined
    const search = args.search as string | undefined
    const limit = (args.limit as number) || 50

    try {
      const result = await window.api.loadClipboardItems({
        limit,
        contentType: contentType as 'text' | 'image' | undefined,
        search: search || undefined,
      })

      const items = result.items as Array<{
        id: string
        contentType: string
        textContent: string | null
        isPinned: boolean
        createdAt: string
        byteSize: number
        labels: Array<{ id: string; name: string; color: string }>
        imageDescription: string | null
        analysisStatus: string
      }>

      if (items.length === 0) {
        return { kind: 'success', message: 'No clipboard items found.' }
      }

      const lines = items.map((item) => {
        const type = item.contentType === 'text' ? '📝' : '🖼️'
        const pinned = item.isPinned ? '📌' : ''
        const preview =
          item.contentType === 'text'
            ? (item.textContent?.slice(0, 80)?.replace(/\n/g, ' ') ?? '(empty)')
            : (item.imageDescription ?? '(no description)')
        const labels = item.labels.map((l) => l.name).join(', ')
        const labelStr = labels ? ` [${labels}]` : ''
        const size = item.byteSize > 1024 ? `${(item.byteSize / 1024).toFixed(1)}KB` : `${item.byteSize}B`
        const previewCell = formatEntityToken('clipboard', item.id, preview)
        return `| ${type}${pinned} | ${previewCell} | ${size} | ${labelStr} | ${item.id} |`
      })

      const message = [
        `**Clipboard Items** (${items.length} shown${result.hasMore ? ', more available' : ''})`,
        '',
        '| Type | Preview | Size | Labels | ID |',
        '|------|---------|------|--------|----|',
        ...lines,
      ].join('\n')

      return { kind: 'success', message }
    } catch (e) {
      return { kind: 'error', message: `Failed to load items: ${e instanceof Error ? e.message : String(e)}` }
    }
  },
}

export default tool
