import { useBookmarkStore } from '@/store/bookmark-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'library_add_bookmark',
  definition: {
    type: 'function',
    function: {
      name: 'library_add_bookmark',
      description: 'Add a bookmark to a specific location in a chapter.',
      parameters: {
        type: 'object',
        properties: {
          bookId: { type: 'string', description: 'The book ID' },
          chapterId: { type: 'string', description: 'The chapter ID' },
          highlightId: { type: 'string', description: 'The highlight or location identifier' },
          label: { type: 'string', description: 'A label for the bookmark' },
          note: { type: 'string', description: 'An optional note for the bookmark' },
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

    const note = (args.note as string) || undefined
    await useBookmarkStore.getState().addBookmark({ bookId, chapterId, highlightId, label, note })
    return { kind: 'success', message: `✅ Bookmark "${label}" added.` }
  },
}

export default tool
