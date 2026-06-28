import { useLibraryStore } from '@/store/library-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'library_delete_chapter',
  definition: {
    type: 'function',
    function: {
      name: 'library_delete_chapter',
      description:
        'Remove a chapter from a book. This is a destructive action that requires user confirmation.',
      parameters: {
        type: 'object',
        properties: {
          chapterId: { type: 'string', description: 'The chapter ID to delete' },
          bookId: { type: 'string', description: 'The book ID the chapter belongs to' },
        },
        required: ['chapterId', 'bookId'],
      },
    },
  },
  execute: async (args, ctx): Promise<ToolResult> => {
    const chapterId = args.chapterId as string
    const bookId = args.bookId as string
    if (!chapterId || !bookId) {
      return { kind: 'error', message: 'chapterId and bookId are required.' }
    }

    const { activeBook } = useLibraryStore.getState()
    let chapterTitle = chapterId
    if (activeBook && activeBook.book.id === bookId) {
      const chapter = activeBook.chapters.find((c) => c.id === chapterId)
      if (chapter) chapterTitle = chapter.title
    }

    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'library_delete_chapter',
          description: `Delete chapter: "${chapterTitle}"`,
          items: [{ path: chapterTitle, type: 'chapter', details: `Book ID: ${bookId}` }],
          warning: `This will permanently delete the chapter "${chapterTitle}". This cannot be undone.`,
        },
        executeAfterConfirm: async () => {
          await useLibraryStore.getState().removeChapter(chapterId, bookId)
          return `✅ Chapter "${chapterTitle}" has been deleted.`
        },
      }
    }

    await useLibraryStore.getState().removeChapter(chapterId, bookId)
    return { kind: 'success', message: `✅ Chapter "${chapterTitle}" has been deleted.` }
  },
}

export default tool
