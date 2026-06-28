import { useBookmarkStore } from '@/store/bookmark-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'library_remove_bookmark',
  definition: {
    type: 'function',
    function: {
      name: 'library_remove_bookmark',
      description: 'Remove a bookmark by its ID.',
      parameters: {
        type: 'object',
        properties: {
          bookmarkId: { type: 'string', description: 'The bookmark ID to remove' },
        },
        required: ['bookmarkId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const bookmarkId = args.bookmarkId as string
    if (!bookmarkId) {
      return { kind: 'error', message: 'bookmarkId is required.' }
    }

    await useBookmarkStore.getState().removeBookmark(bookmarkId)
    return { kind: 'success', message: '✅ Bookmark removed.' }
  },
}

export default tool
