import { useBookmarkStore } from '@/store/bookmark-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'library_toggle_bookmark',
  definition: {
    type: 'function',
    function: {
      name: 'library_toggle_bookmark',
      description: 'Toggle a bookmark on or off for a specific location. If a bookmark exists, it will be removed; otherwise, it will be added.',
      parameters: {
        type: 'object',
        properties: {
          bookId: { type: 'string', description: 'The book ID' },
          chapterId: { type: 'string', description: 'The chapter ID' },
          highlightId: { type: 'string', description: 'The highlight or location identifier' },
          label: { type: 'string', description: 'A label for the bookmark' },
        },
        required: ['bookId', 'chapterId', 'highlightId', 'label'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const bookId = args.bookId as string
    const chapterId = args.chapterId as string
    const highlightId = args.highlightId as string
    const label = args.label as string
    if (!bookId || !chapterId || !highlightId || !label) {
      return { kind: 'error', message: 'bookId, chapterId, highlightId, and label are required.' }
    }

    await useBookmarkStore.getState().toggleBookmark({ bookId, chapterId, highlightId, label })
    return { kind: 'success', message: `✅ Bookmark "${label}" toggled.` }
  },
}

export default tool
