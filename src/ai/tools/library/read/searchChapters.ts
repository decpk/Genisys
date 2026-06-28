import { useLibraryStore } from '@/store/library-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'library_search_chapters',
  definition: {
    type: 'function',
    function: {
      name: 'library_search_chapters',
      description:
        'Search chapter titles and content within the currently active book. Returns matching chapters with context snippets.',
      parameters: {
        type: 'object',
        properties: {
          bookId: { type: 'string', description: 'The book ID to search in' },
          query: { type: 'string', description: 'Search query string' },
        },
        required: ['bookId', 'query'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const bookId = args.bookId as string
    const query = args.query as string
    if (!bookId || !query) {
      return { kind: 'error', message: 'bookId and query are required.' }
    }

    const { activeBook } = useLibraryStore.getState()
    if (!activeBook || activeBook.book.id !== bookId) {
      return { kind: 'error', message: `Book "${bookId}" is not currently active. Select it first.` }
    }

    const lowerQuery = query.toLowerCase()
    const matches = activeBook.chapters.filter(
      (c) => c.title.toLowerCase().includes(lowerQuery) || c.content.toLowerCase().includes(lowerQuery),
    )

    if (matches.length === 0) {
      return { kind: 'success', message: `No chapters match "${query}".` }
    }

    const lines = matches.map((c) => {
      let snippet = ''
      const contentLower = c.content.toLowerCase()
      const idx = contentLower.indexOf(lowerQuery)
      if (idx !== -1) {
        const start = Math.max(0, idx - 40)
        const end = Math.min(c.content.length, idx + query.length + 40)
        snippet = `...${c.content.slice(start, end)}...`
      }
      return `| ${c.chapterNumber} | ${c.title} | ${snippet || '(title match)'} | ${c.id} |`
    })

    const message = [
      `**Search results for "${query}"** (${matches.length} match${matches.length === 1 ? '' : 'es'})`,
      '',
      '| # | Title | Context | ID |',
      '|---|-------|---------|-----|',
      ...lines,
    ].join('\n')

    return { kind: 'success', message }
  },
}

export default tool
