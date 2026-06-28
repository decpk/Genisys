import { useApiClientStore } from '@/store/api-client-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'apiclient_add_env_variable',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_add_env_variable',
      description: 'Add a new environment variable to an API environment.',
      parameters: {
        type: 'object',
        properties: {
          environmentId: { type: 'string', description: 'The environment ID' },
          key: { type: 'string', description: 'Variable key' },
          value: { type: 'string', description: 'Variable value' },
          description: { type: 'string', description: 'Variable description' },
          isSecret: { type: 'boolean', description: 'Whether the variable is a secret (masked in UI)' },
        },
        required: ['environmentId', 'key', 'value'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const environmentId = args.environmentId as string
    const key = args.key as string
    const value = args.value as string
    if (!environmentId || !key || value === undefined) {
      return { kind: 'error', message: 'environmentId, key, and value are required.' }
    }

    const store = useApiClientStore.getState()
    const env = store.environments.find((e) => e.id === environmentId)
    if (!env) {
      return { kind: 'error', message: `Environment "${environmentId}" not found.` }
    }

    await store.addEnvironmentVariable(environmentId, key, value)

    // Apply optional fields if provided
    const vars = useApiClientStore.getState().environmentVariables[environmentId] || []
    const newVar = vars.find((v) => v.key === key)
    if (newVar && (args.description !== undefined || args.isSecret !== undefined)) {
      const updates: Record<string, unknown> = {}
      if (args.description !== undefined) updates.description = args.description
      if (args.isSecret !== undefined) updates.isSecret = args.isSecret
      await store.updateEnvironmentVariable(newVar.id, updates)
    }

    return {
      kind: 'success',
      message: `✅ Variable "${key}" added to environment "${env.name}".`,
    }
  },
}

export default tool
