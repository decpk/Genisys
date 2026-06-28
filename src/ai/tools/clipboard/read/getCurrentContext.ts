import { useClipboardStore } from '@/store/clipboard-store'
import { useClipboardLabelStore } from '@/store/clipboard-label-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'clipboard_get_current_context',
  definition: {
    type: 'function',
    function: {
      name: 'clipboard_get_current_context',
      description:
        'Get the current clipboard manager state including filter, search query, fuzzy search status, loaded item count, and available labels.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  execute: async (): Promise<ToolResult> => {
    const state = useClipboardStore.getState()
    const labelState = useClipboardLabelStore.getState()

    const parts: string[] = []
    parts.push('**Clipboard Manager State**')
    parts.push('')
    parts.push(`- **Loaded items:** ${state.items.length}`)
    parts.push(`- **Has more:** ${state.hasMore ? 'yes' : 'no'}`)
    parts.push(`- **Active filter:** ${state.filter}`)
    parts.push(`- **Search query:** ${state.searchQuery || '(none)'}`)
    parts.push(`- **Fuzzy search:** ${state.isFuzzySearch ? 'on' : 'off'}`)
    parts.push(`- **Preview item:** ${state.previewItemId || '(none)'}`)
    parts.push('')
    parts.push('**Statistics**')
    parts.push(`- Total: ${state.stats.total}`)
    parts.push(`- Text: ${state.stats.textCount}`)
    parts.push(`- Images: ${state.stats.imageCount}`)
    parts.push(`- Labeled: ${state.stats.labeledCount}`)

    if (labelState.labels.length > 0) {
      parts.push('')
      parts.push('**Labels**')
      for (const label of labelState.labels) {
        parts.push(`- ${label.name} (${label.color}) — ID: ${label.id}`)
      }
    } else {
      parts.push('')
      parts.push('**Labels:** (none)')
    }

    return { kind: 'success', message: parts.join('\n') }
  },
}

export default tool
