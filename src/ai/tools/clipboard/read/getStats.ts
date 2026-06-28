import { useClipboardStore } from '@/store/clipboard-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'clipboard_get_stats',
  definition: {
    type: 'function',
    function: {
      name: 'clipboard_get_stats',
      description:
        'Get clipboard statistics including total item count, text count, image count, pinned count, and labeled count.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  execute: async (): Promise<ToolResult> => {
    try {
      const result = await window.api.clipboardStats()
      const stats = result as { total: number; textCount: number; imageCount: number; labeledCount: number; pinnedCount: number }

      const message = [
        '**Clipboard Statistics**',
        '',
        `- **Total items:** ${stats.total}`,
        `- **Text items:** ${stats.textCount}`,
        `- **Image items:** ${stats.imageCount}`,
        `- **Pinned items:** ${stats.pinnedCount}`,
        `- **Labeled items:** ${stats.labeledCount}`,
      ].join('\n')

      return { kind: 'success', message }
    } catch (e) {
      return { kind: 'error', message: `Failed to load stats: ${e instanceof Error ? e.message : String(e)}` }
    }
  },
}

export default tool
