import { fetchAITransform } from '@/components/ClipboardManager/utils/ai-transform/api/fetchAITransform'
import { buildClipboardSmartComposeSystemPrompt } from '@/prompts/clipboardSmartComposeSystemPrompt'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'clipboard_smart_compose',
  definition: {
    type: 'function',
    function: {
      name: 'clipboard_smart_compose',
      description:
        'Assemble multiple clipboard items into a polished, structured document. AI analyzes the content, creates an outline, adds transitions, headings, and formatting. Turns scattered clips into a coherent document — like a report, email, wiki page, or technical spec.',
      parameters: {
        type: 'object',
        properties: {
          itemIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'IDs of clipboard items to compose from. If omitted, uses the most recent 15 items.',
          },
          documentType: {
            type: 'string',
            enum: ['report', 'email', 'wiki', 'spec', 'readme', 'notes', 'blog', 'presentation-outline'],
            description: 'Type of document to create. Each type has its own structure and tone.',
          },
          title: {
            type: 'string',
            description: 'Title or topic for the composed document. AI will infer one if not provided.',
          },
          additionalInstructions: {
            type: 'string',
            description: 'Any extra instructions for how to compose the document.',
          },
        },
        required: ['documentType'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const documentType = args.documentType as string
    const title = (args.title as string) || ''
    const extra = (args.additionalInstructions as string) || ''
    const itemIds = args.itemIds as string[] | undefined

    try {
      let sourceItems: Array<{
        id: string
        contentType: string
        textContent: string | null
        imageDescription: string | null
        labels: Array<{ name: string }>
      }>

      if (itemIds && itemIds.length > 0) {
        const result = await window.api.loadClipboardItems({ limit: 200 })
        const all = result.items as typeof sourceItems
        sourceItems = itemIds
          .map((id) => all.find((i) => i.id === id))
          .filter(Boolean) as typeof sourceItems
      } else {
        const result = await window.api.loadClipboardItems({ limit: 15 })
        sourceItems = result.items as typeof sourceItems
      }

      if (sourceItems.length === 0) {
        return { kind: 'error', message: 'No clipboard items found to compose from.' }
      }

      const fragments = sourceItems.map((item, idx) => {
        const content = item.contentType === 'text'
          ? (item.textContent ?? '(empty)')
          : `[Image: ${item.imageDescription ?? 'no description'}]`
        const labels = item.labels.length > 0 ? ` [${item.labels.map((l) => l.name).join(', ')}]` : ''
        return `--- Fragment ${idx + 1}${labels} ---\n${content}`
      }).join('\n\n')

      const systemPrompt = buildClipboardSmartComposeSystemPrompt({ documentType, title, extra })

      const composed = await fetchAITransform(
        systemPrompt,
        `Compose a ${documentType} from these ${sourceItems.length} clipboard fragments:\n\n${fragments}`,
      )

      return { kind: 'success', message: composed }
    } catch (e) {
      return { kind: 'error', message: `Composition failed: ${e instanceof Error ? e.message : String(e)}` }
    }
  },
}

export default tool
