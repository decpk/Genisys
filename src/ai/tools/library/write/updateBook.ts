import { useLibraryStore } from '@/store/library-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'library_update_book',
  definition: {
    type: 'function',
    function: {
      name: 'library_update_book',
      description: 'Update a book\'s metadata (title or description).',
      parameters: {
        type: 'object',
        properties: {
          bookId: { type: 'string', description: 'The book ID to update' },
          title: { type: 'string', description: 'New title for the book' },
          description: { type: 'string', description: 'New description for the book' },
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

    const store = useLibraryStore.getState()
    const book = store.books.find((b) => b.id === bookId)
    if (!book) {
      return { kind: 'error', message: `Book "${bookId}" not found.` }
    }

    const updated = { ...book }
    if (args.title) updated.title = args.title as string
    if (args.description !== undefined) updated.description = args.description as string

    await store.updateBook(updated)
    return { kind: 'success', message: `✅ Book "${updated.title}" updated.` }
  },
}

export default tool
