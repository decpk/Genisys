import { useLibraryStore } from '@/store/library-store'
import { DEFAULT_LANGUAGE } from '@/lib/languages'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'library_add_chapter',
  definition: {
    type: 'function',
    function: {
      name: 'library_add_chapter',
      description: 'Add a new chapter to a book.',
      parameters: {
        type: 'object',
        properties: {
          bookId: { type: 'string', description: 'The book ID to add the chapter to' },
          title: { type: 'string', description: 'The chapter title' },
          chapterNumber: { type: 'number', description: 'The chapter number' },
          content: { type: 'string', description: 'The chapter content' },
          sortOrder: { type: 'number', description: 'Sort order for the chapter' },
        },
        required: ['bookId', 'title', 'chapterNumber'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const bookId = args.bookId as string
    const title = args.title as string
    const chapterNumber = args.chapterNumber as number
    if (!bookId || !title || chapterNumber === undefined) {
      return { kind: 'error', message: 'bookId, title, and chapterNumber are required.' }
    }

    const content = (args.content as string) || ''
    const sortOrder = (args.sortOrder as number) ?? chapterNumber

    // Inherit the book's language from an existing chapter, falling back to the default.
    const { activeBook } = useLibraryStore.getState()
    const language =
      activeBook?.book.id === bookId
        ? activeBook.chapters[0]?.language ?? DEFAULT_LANGUAGE
        : DEFAULT_LANGUAGE

    const chapter = await useLibraryStore.getState().addChapter({
      bookId,
      title,
      chapterNumber,
      content,
      sortOrder,
      status: content ? 'completed' : 'pending',
      isRead: false,
      language,
    })

    return {
      kind: 'success',
      message: `✅ Chapter ${chapterNumber} "${title}" added (ID: ${chapter.id}).`,
    }
  },
}

export default tool
