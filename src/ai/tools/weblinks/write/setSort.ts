import { useWebLinksStore } from '@/store/weblinks-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const VALID_KEYS = ['dateAdded', 'title', 'siteName'] as const
const VALID_DIRS = ['asc', 'desc'] as const

const tool: ToolModule = {
  name: 'previewer_set_sort',
  definition: {
    type: 'function',
    function: {
      name: 'previewer_set_sort',
      description:
        'Set the sort field and/or direction for the saved-preview list. Only the values you provide are changed.',
      parameters: {
        type: 'object',
        properties: {
          key: {
            type: 'string',
            enum: ['dateAdded', 'title', 'siteName'],
            description: 'Field to sort by.',
          },
          direction: { type: 'string', enum: ['asc', 'desc'], description: 'Sort direction.' },
        },
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const key = args.key as (typeof VALID_KEYS)[number] | undefined
    const direction = args.direction as (typeof VALID_DIRS)[number] | undefined

    if (key === undefined && direction === undefined) {
      return { kind: 'error', message: 'Provide at least one of `key` or `direction`.' }
    }
    if (key !== undefined && !VALID_KEYS.includes(key)) {
      return { kind: 'error', message: `Invalid key "${key}". Use one of: ${VALID_KEYS.join(', ')}.` }
    }
    if (direction !== undefined && !VALID_DIRS.includes(direction)) {
      return {
        kind: 'error',
        message: `Invalid direction "${direction}". Use one of: ${VALID_DIRS.join(', ')}.`,
      }
    }

    const store = useWebLinksStore.getState()
    if (key !== undefined) store.setSortKey(key)
    if (direction !== undefined) store.setSortDirection(direction)

    const next = useWebLinksStore.getState()
    return { kind: 'success', message: `✅ Sort set to ${next.sortKey} ${next.sortDirection}.` }
  },
}

export default tool
