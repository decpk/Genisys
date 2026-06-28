import { useLibraryStore } from '@/store/library-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'library_delete_book',
  definition: {
    type: 'function',
    function: {
      name: 'library_delete_book',
      description: 'Delete a book and all its chapters. This is a destructive action that requires user confirmation.',
      parameters: {
        type: 'object',
        properties: {
          bookId: { type: 'string', description: 'The book ID to delete' },
        },
        required: ['bookId'],
      },
    },
  },
  execute: async (args, ctx): Promise<ToolResult> => {
    const bookId = args.bookId as string
    if (!bookId) {
      return { kind: 'error', message: 'bookId is required.' }
    }

    const store = useLibraryStore.getState()
    const book = store.books.find((b) => b.id === bookId)
    if (!book) {
      return { kind: 'error', message: `Book "${bookId}" not found.` }
    }

    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'library_delete_book',
          description: `Delete book: "${book.title}"`,
          items: [{ path: book.title, type: 'book', details: `${book.chapterCount} chapters, status: ${book.status}` }],
          warning: `This will permanently delete the book "${book.title}" and all its chapters. This cannot be undone.`,
        },
        executeAfterConfirm: async () => {
          await useLibraryStore.getState().removeBook(bookId)
          return `✅ Book "${book.title}" has been deleted.`
        },
      }
    }

    await store.removeBook(bookId)
    return { kind: 'success', message: `✅ Book "${book.title}" has been deleted.` }
  },
}

export default tool
