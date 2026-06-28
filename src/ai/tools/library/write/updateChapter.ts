import { useLibraryStore } from '@/store/library-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'library_update_chapter',
  definition: {
    type: 'function',
    function: {
      name: 'library_update_chapter',
      description: 'Update a chapter\'s title or content.',
      parameters: {
        type: 'object',
        properties: {
          chapterId: { type: 'string', description: 'The chapter ID to update' },
          bookId: { type: 'string', description: 'The book ID the chapter belongs to (uses active book if omitted)' },
          title: { type: 'string', description: 'New title for the chapter' },
          content: { type: 'string', description: 'New content for the chapter' },
        },
        required: ['chapterId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const chapterId = args.chapterId as string
    if (!chapterId) {
      return { kind: 'error', message: 'chapterId is required.' }
    }

    const store = useLibraryStore.getState()
    const { activeBook } = store
    if (!activeBook) {
      return { kind: 'error', message: 'No book is currently active.' }
    }

    const chapter = activeBook.chapters.find((c) => c.id === chapterId)
    if (!chapter) {
      return { kind: 'error', message: `Chapter "${chapterId}" not found in active book.` }
    }

    const updated = { ...chapter }
    if (args.title) updated.title = args.title as string
    if (args.content !== undefined) updated.content = args.content as string

    await store.updateChapter(updated)
    return { kind: 'success', message: `✅ Chapter "${updated.title}" updated.` }
  },
}

export default tool
