import { useLibraryStore } from '@/store/library-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { resolveActiveChapter } from '@/ai/tools/library/utils/resolveActiveChapter'
import { insertContentAtAnchor } from '@/ai/tools/library/utils/insertContentAtAnchor'

const tool: ToolModule = {
  name: 'library_insert_chapter_content',
  definition: {
    type: 'function',
    function: {
      name: 'library_insert_chapter_content',
      description:
        'Insert new markdown content into a chapter at a specific location — after a named heading, after a snippet of existing text, or appended to the end if no anchor is given. Use this to add a section in between existing content without rewriting the whole chapter.',
      parameters: {
        type: 'object',
        properties: {
          chapterId: { type: 'string', description: 'The chapter ID to insert content into' },
          text: { type: 'string', description: 'The markdown content to insert' },
          afterHeading: {
            type: 'string',
            description: 'Exact heading text to insert after, e.g. "Step 6"',
          },
          afterText: {
            type: 'string',
            description: 'A snippet of existing chapter text to insert after',
          },
        },
        required: ['chapterId', 'text'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const chapterId = args.chapterId as string
    const text = args.text as string

    const resolved = resolveActiveChapter(chapterId)
    if ('error' in resolved) {
      return { kind: 'error', message: resolved.error }
    }

    const result = insertContentAtAnchor(resolved.chapter.content, text, {
      afterHeading: args.afterHeading as string | undefined,
      afterText: args.afterText as string | undefined,
    })
    if ('error' in result) {
      return { kind: 'error', message: result.error }
    }

    await useLibraryStore.getState().updateChapter({ ...resolved.chapter, content: result.content })
    return { kind: 'success', message: `✅ Inserted content into chapter "${resolved.chapter.title}".` }
  },
}

export default tool
