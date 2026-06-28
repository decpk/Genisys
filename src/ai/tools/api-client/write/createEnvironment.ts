import { useApiClientStore } from '@/store/api-client-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'apiclient_create_environment',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_create_environment',
      description: 'Create a new API environment with optional base URL, description, and color.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Environment name' },
          baseUrl: { type: 'string', description: 'Base URL for this environment' },
          description: { type: 'string', description: 'Description' },
          color: { type: 'string', description: 'Color (hex or named)' },
        },
        required: ['name'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const name = args.name as string
    if (!name) {
      return { kind: 'error', message: 'name is required.' }
    }

    const color = args.color as string | undefined
    const store = useApiClientStore.getState()
    const env = await store.addEnvironment(name, color)

    const updates: Record<string, unknown> = {}
    if (args.baseUrl !== undefined) updates.baseUrl = args.baseUrl
    if (args.description !== undefined) updates.description = args.description

    if (Object.keys(updates).length > 0) {
      await store.updateEnvironment(env.id, updates)
    }

    return {
      kind: 'success',
      message: `✅ Environment "${env.name}" created (ID: ${env.id}).`,
    }
  },
}

export default tool
