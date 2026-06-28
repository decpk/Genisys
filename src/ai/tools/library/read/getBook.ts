import { useLibraryStore } from '@/store/library-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'library_get_book',
  definition: {
    type: 'function',
    function: {
      name: 'library_get_book',
      description:
        'Get details of the currently selected book including its chapters. Returns book metadata and a list of all chapters with their status, read state, and content length.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  execute: async (): Promise<ToolResult> => {
    const { activeBook } = useLibraryStore.getState()
    if (!activeBook) {
      return { kind: 'error', message: 'No book is currently selected.' }
    }

    const { book, chapters } = activeBook
    const readCount = chapters.filter((c) => c.isRead).length
    const completedCount = chapters.filter((c) => c.status === 'completed').length

    const chapterLines = chapters.map((c) => {
      const read = c.isRead ? '✅' : '⬜'
      const contentLen = c.content ? `${c.content.length} chars` : 'empty'
      return `| ${read} | ${c.chapterNumber} | ${c.title} | ${c.status} | ${contentLen} | ${c.id} |`
    })

    const message = [
      `**${book.title}**`,
      '',
      `- **ID:** ${book.id}`,
      `- **Description:** ${book.description || '(none)'}`,
      `- **Status:** ${book.status}`,
      `- **Model:** ${book.model || '(default)'}`,
      `- **Chapters:** ${chapters.length} total, ${completedCount} completed, ${readCount} read`,
      `- **Created:** ${book.createdAt}`,
      `- **Updated:** ${book.updatedAt}`,
      '',
      '| Read | # | Title | Status | Content | ID |',
      '|------|---|-------|--------|---------|----|',
      ...chapterLines,
    ].join('\n')

    return { kind: 'success', message }
  },
}

export default tool
