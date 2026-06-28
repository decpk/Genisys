import { useClipboardStore } from '@/store/clipboard-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'clipboard_analyze_image',
  definition: {
    type: 'function',
    function: {
      name: 'clipboard_analyze_image',
      description:
        'Trigger AI analysis of a clipboard image to generate a description. Only works for image-type items.',
      parameters: {
        type: 'object',
        properties: {
          itemId: {
            type: 'string',
            description: 'The ID of the image clipboard item to analyze.',
          },
        },
        required: ['itemId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const itemId = args.itemId as string
    if (!itemId) {
      return { kind: 'error', message: 'itemId is required.' }
    }

    const items = useClipboardStore.getState().items
    const item = items.find((i) => i.id === itemId)
    if (!item) {
      return { kind: 'error', message: `Item "${itemId}" not found.` }
    }
    if (item.contentType !== 'image') {
      return { kind: 'error', message: 'Can only analyze image items.' }
    }
    if (item.analysisStatus === 'pending') {
      return { kind: 'success', message: 'Analysis is already in progress for this image.' }
    }
    if (item.analysisStatus === 'done' && item.imageDescription) {
      return {
        kind: 'success',
        message: `Image already has a description: "${item.imageDescription}". Use clipboard_update_image_description to change it.`,
      }
    }

    try {
      useClipboardStore.getState().updateItemAnalysis(itemId, null, 'pending')
      await window.api.analyzeClipboardImage(itemId)
      return { kind: 'success', message: '✅ Image analysis started. The description will be updated when complete.' }
    } catch (e) {
      useClipboardStore.getState().updateItemAnalysis(itemId, null, 'failed')
      return { kind: 'error', message: `Analysis failed: ${e instanceof Error ? e.message : String(e)}` }
    }
  },
}

export default tool
