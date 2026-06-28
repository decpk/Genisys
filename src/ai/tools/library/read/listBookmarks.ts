import { useBookmarkStore } from '@/store/bookmark-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'library_list_bookmarks',
  definition: {
    type: 'function',
    function: {
      name: 'library_list_bookmarks',
      description: 'List all bookmarks for a specific book, including chapter info, labels, and notes.',
      parameters: {
        type: 'object',
        properties: {
          bookId: { type: 'string', description: 'The book ID to list bookmarks for' },
        },
        required: ['bookId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const bookId = args.bookId as string
    if (!bookId) {
      return { kind: 'error', message: 'bookId is required.' }
    }

    const store = useBookmarkStore.getState()
    if (!store.isLoaded) {
      await store.loadBookmarks()
    }

    const bookmarks = useBookmarkStore.getState().bookmarks.filter((b) => b.bookId === bookId)
    if (bookmarks.length === 0) {
      return { kind: 'success', message: 'No bookmarks found for this book.' }
    }

    const lines = bookmarks.map((b) => {
      const note = b.note ? b.note.slice(0, 50) : ''
      return `| ${b.label} | Ch.${b.chapterNumber} - ${b.chapterTitle} | ${note} | ${b.id} |`
    })

    const message = [
      `**Bookmarks** (${bookmarks.length} total)`,
      '',
      '| Label | Chapter | Note | ID |',
      '|-------|---------|------|----|',
      ...lines,
    ].join('\n')

    return { kind: 'success', message }
  },
}

export default tool
