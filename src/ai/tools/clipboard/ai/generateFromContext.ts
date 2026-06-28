import { fetchAITransform } from '@/components/ClipboardManager/utils/ai-transform/api/fetchAITransform'
import { buildClipboardGenerateFromContextSystemPrompt } from '@/prompts/clipboardGenerateFromContextSystemPrompt'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'clipboard_generate_from_context',
  definition: {
    type: 'function',
    function: {
      name: 'clipboard_generate_from_context',
      description:
        'Generate new content using specified clipboard items as context. Can draft emails, write documentation, create summaries, generate code, compose messages, or produce any text content based on what the user has previously copied.',
      parameters: {
        type: 'object',
        properties: {
          itemIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'IDs of clipboard items to use as context. If omitted, uses the most recent 10 items.',
          },
          instruction: {
            type: 'string',
            description: 'What to generate. E.g., "draft a reply email", "write docs for this API", "create a commit message", "summarize into meeting notes".',
          },
          outputFormat: {
            type: 'string',
            enum: ['text', 'markdown', 'code', 'email', 'json'],
            description: 'Desired output format. Defaults to "markdown".',
          },
        },
        required: ['instruction'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const instruction = args.instruction as string
    if (!instruction?.trim()) {
      return { kind: 'error', message: 'instruction is required — tell me what to generate.' }
    }

    const outputFormat = (args.outputFormat as string) || 'markdown'
    const itemIds = args.itemIds as string[] | undefined

    try {
      let contextItems: Array<{
        id: string
        contentType: string
        textContent: string | null
        imageDescription: string | null
        labels: Array<{ name: string }>
      }>

      if (itemIds && itemIds.length > 0) {
        const result = await window.api.loadClipboardItems({ limit: 200 })
        const all = result.items as typeof contextItems
        contextItems = itemIds
          .map((id) => all.find((i) => i.id === id))
          .filter(Boolean) as typeof contextItems
      } else {
        const result = await window.api.loadClipboardItems({ limit: 10 })
        contextItems = result.items as typeof contextItems
      }

      if (contextItems.length === 0) {
        return { kind: 'error', message: 'No clipboard items found to use as context.' }
      }

      const context = contextItems.map((item, idx) => {
        const content = item.contentType === 'text'
          ? (item.textContent ?? '(empty)')
          : `[Image: ${item.imageDescription ?? 'no description'}]`
        const labels = item.labels.length > 0 ? ` [${item.labels.map((l) => l.name).join(', ')}]` : ''
        return `--- Context Item ${idx + 1}${labels} ---\n${content}`
      }).join('\n\n')

      const systemPrompt = buildClipboardGenerateFromContextSystemPrompt(outputFormat)

      const generated = await fetchAITransform(
        systemPrompt,
        `Context from ${contextItems.length} clipboard items:\n\n${context}\n\n---\n\nUser request: ${instruction}`,
      )

      return { kind: 'success', message: generated }
    } catch (e) {
      return { kind: 'error', message: `Generation failed: ${e instanceof Error ? e.message : String(e)}` }
    }
  },
}

export default tool
