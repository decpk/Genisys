import { useWebLinksStore } from '@/store/weblinks-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'previewer_open_url',
  definition: {
    type: 'function',
    function: {
      name: 'previewer_open_url',
      description: "Open a URL in the user's default web browser.",
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'The URL to open in the default browser.' },
        },
        required: ['url'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const url = args.url as string
    if (!url) {
      return { kind: 'error', message: 'url is required.' }
    }

    await useWebLinksStore.getState().openInBrowser(url)
    return { kind: 'success', message: `✅ Opened ${url} in the default browser.` }
  },
}

export default tool
