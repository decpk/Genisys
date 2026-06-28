import { useApiClientStore } from '@/store/api-client-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'apiclient_update_env_variable',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_update_env_variable',
      description: 'Update an existing environment variable key, value, description, secret flag, or enabled state.',
      parameters: {
        type: 'object',
        properties: {
          variableId: { type: 'string', description: 'The variable ID to update' },
          key: { type: 'string', description: 'New key' },
          value: { type: 'string', description: 'New value' },
          description: { type: 'string', description: 'New description' },
          isSecret: { type: 'boolean', description: 'Whether the variable is a secret' },
          enabled: { type: 'boolean', description: 'Whether the variable is enabled' },
        },
        required: ['variableId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const variableId = args.variableId as string
    if (!variableId) {
      return { kind: 'error', message: 'variableId is required.' }
    }

    const updates: Record<string, unknown> = {}
    if (args.key !== undefined) updates.key = args.key
    if (args.value !== undefined) updates.value = args.value
    if (args.description !== undefined) updates.description = args.description
    if (args.isSecret !== undefined) updates.isSecret = args.isSecret
    if (args.enabled !== undefined) updates.enabled = args.enabled

    const store = useApiClientStore.getState()
    await store.updateEnvironmentVariable(variableId, updates)

    return { kind: 'success', message: `✅ Environment variable "${variableId}" updated.` }
  },
}

export default tool
