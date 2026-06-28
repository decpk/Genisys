import { useApiClientStore } from '@/store/api-client-store'
import type { ImportFormat } from '@/components/APIClient/utils/import-parsers'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const VALID_FORMATS: ImportFormat[] = [
  'curl',
  'raw-http',
  'fetch',
  'axios',
  'httpie',
  'powershell',
  'python-requests',
  'wget',
]

const tool: ToolModule = {
  name: 'apiclient_import_request',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_import_request',
      description:
        'Import an API request from a code snippet or raw HTTP into a collection. Supported formats: curl, raw-http, fetch, axios, httpie, powershell, python-requests, wget.',
      parameters: {
        type: 'object',
        properties: {
          format: {
            type: 'string',
            enum: VALID_FORMATS,
            description: 'Import format of the input snippet',
          },
          input: { type: 'string', description: 'The import data (the snippet or raw HTTP text)' },
          collectionId: { type: 'string', description: 'The collection ID to import into' },
          folderId: { type: 'string', description: 'Optional folder ID' },
        },
        required: ['format', 'input', 'collectionId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const format = args.format as string
    const input = args.input as string
    const collectionId = args.collectionId as string
    if (!format || !input || !collectionId) {
      return { kind: 'error', message: 'format, input, and collectionId are required.' }
    }
    if (!VALID_FORMATS.includes(format as ImportFormat)) {
      return {
        kind: 'error',
        message: `Invalid format "${format}". Must be one of: ${VALID_FORMATS.join(', ')}.`,
      }
    }

    const folderId = args.folderId as string | undefined
    const store = useApiClientStore.getState()
    const request = await store.importRequest(format as ImportFormat, input, collectionId, folderId)

    return {
      kind: 'success',
      message: `✅ Imported request from ${format} format as "${request.name}" (${request.method} ${request.url}) (ID: ${request.id}).`,
    }
  },
}

export default tool
