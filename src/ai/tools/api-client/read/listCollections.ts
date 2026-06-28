import { useApiClientStore } from '@/store/api-client-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'apiclient_list_collections',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_list_collections',
      description: 'List all API collections with their name, description, color, and request count.',
      parameters: { type: 'object', properties: {} },
    },
  },
  execute: async (): Promise<ToolResult> => {
    const store = useApiClientStore.getState()
    if (!store.isLoaded) {
      await store.loadAll()
    }

    const { collections, requests } = useApiClientStore.getState()
    if (collections.length === 0) {
      return { kind: 'success', message: 'No collections found.' }
    }

    const lines = collections.map((c) => {
      const reqCount = requests.filter((r) => r.collectionId === c.id).length
      return `| ${c.name} | ${c.description || '—'} | ${c.color || '—'} | ${reqCount} | ${c.id} |`
    })

    const message = [
      `**Collections** (${collections.length})`,
      '',
      '| Name | Description | Color | Requests | ID |',
      '|------|-------------|-------|----------|----|',
      ...lines,
    ].join('\n')

    return { kind: 'success', message }
  },
}

export default tool
