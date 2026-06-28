import { useSettingsStore } from '@/store/settings-store'
import type { ApiClientSortField, ApiClientSortDirection } from '@/store/settings-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const VALID_FIELDS = ['name', 'method', 'createdAt', 'updatedAt'] as const
const VALID_DIRECTIONS = ['asc', 'desc'] as const

const tool: ToolModule = {
  name: 'apiclient_set_sort',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_set_sort',
      description: 'Set how requests are sorted in the API client sidebar. Provide a field and/or a direction; omitted values are left unchanged.',
      parameters: {
        type: 'object',
        properties: {
          field: {
            type: 'string',
            enum: ['name', 'method', 'createdAt', 'updatedAt'],
            description: 'The field to sort requests by',
          },
          direction: {
            type: 'string',
            enum: ['asc', 'desc'],
            description: 'Sort direction',
          },
        },
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const field = args.field as string | undefined
    const direction = args.direction as string | undefined

    if (field === undefined && direction === undefined) {
      return { kind: 'error', message: 'Provide at least one of "field" or "direction".' }
    }

    const settings = useSettingsStore.getState()
    const applied: string[] = []

    if (field !== undefined) {
      if (!VALID_FIELDS.includes(field as ApiClientSortField)) {
        return { kind: 'error', message: `Invalid field "${field}". Must be one of: ${VALID_FIELDS.join(', ')}.` }
      }
      settings.setApiClientSortField(field as ApiClientSortField)
      applied.push(`field → ${field}`)
    }

    if (direction !== undefined) {
      if (!VALID_DIRECTIONS.includes(direction as ApiClientSortDirection)) {
        return { kind: 'error', message: `Invalid direction "${direction}". Must be one of: ${VALID_DIRECTIONS.join(', ')}.` }
      }
      settings.setApiClientSortDirection(direction as ApiClientSortDirection)
      applied.push(`direction → ${direction}`)
    }

    return { kind: 'success', message: `✅ Sort updated (${applied.join(', ')}).` }
  },
}

export default tool
