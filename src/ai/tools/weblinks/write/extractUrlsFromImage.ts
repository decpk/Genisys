import { useWebLinksStore } from '@/store/weblinks-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'previewer_extract_urls_from_image',
  definition: {
    type: 'function',
    function: {
      name: 'previewer_extract_urls_from_image',
      description:
        'Extract candidate URLs from a screenshot using the vision model. Requires a base64 image data URL (e.g. "data:image/png;base64,…"), not a file path or web URL. Returns the list of URLs found in the image.',
      parameters: {
        type: 'object',
        properties: {
          imageDataUrl: {
            type: 'string',
            description:
              'A base64 image data URL (e.g. "data:image/png;base64,…") to scan for URLs.',
          },
        },
        required: ['imageDataUrl'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const imageDataUrl = args.imageDataUrl as string
    if (!imageDataUrl) {
      return { kind: 'error', message: 'imageDataUrl is required (a base64 image data URL).' }
    }

    let urls: string[]
    try {
      urls = await useWebLinksStore.getState().extractUrlsFromImage(imageDataUrl)
    } catch (caught) {
      return { kind: 'error', message: caught instanceof Error ? caught.message : String(caught) }
    }

    const message = urls.length
      ? `Found ${urls.length} URL(s):\n${urls.map((u) => '- ' + u).join('\n')}`
      : 'No URLs found in the image.'
    return { kind: 'success', message }
  },
}

export default tool
