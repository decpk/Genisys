import { useLibraryStore } from '@/store/library-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'library_list_books',
  definition: {
    type: 'function',
    function: {
      name: 'library_list_books',
      description:
        'List all books in the library with metadata including title, status, chapter count, model, and timestamps.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  execute: async (): Promise<ToolResult> => {
    const store = useLibraryStore.getState()
    if (!store.isLoaded) {
      await store.loadBooks()
    }

    const { books } = useLibraryStore.getState()
    if (books.length === 0) {
      return { kind: 'success', message: 'No books in the library.' }
    }

    const lines = books.map((b) => {
      return `| ${b.title} | ${b.status} | ${b.chapterCount} | ${b.model || '(default)'} | ${b.id} |`
    })

    const message = [
      `**Library** (${books.length} book${books.length === 1 ? '' : 's'})`,
      '',
      '| Title | Status | Chapters | Model | ID |',
      '|-------|--------|----------|-------|----|',
      ...lines,
    ].join('\n')

    return { kind: 'success', message }
  },
}

export default tool
