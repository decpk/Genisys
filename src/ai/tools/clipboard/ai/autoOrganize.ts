import { useClipboardStore } from '@/store/clipboard-store'
import { useClipboardLabelStore } from '@/store/clipboard-label-store'
import { fetchAITransform } from '@/components/ClipboardManager/utils/ai-transform/api/fetchAITransform'
import { clipboardAutoOrganizeSystemPrompt } from '@/prompts/clipboardAutoOrganizeSystemPrompt'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'clipboard_auto_organize',
  definition: {
    type: 'function',
    function: {
      name: 'clipboard_auto_organize',
      description:
        'AI reads all unlabeled clipboard items, understands their content semantically, automatically creates appropriate labels, and assigns them. Turns a messy clipboard into an organized collection in one command.',
      parameters: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Maximum number of unlabeled items to organize. Defaults to 50.',
          },
        },
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const limit = Math.min((args.limit as number) || 50, 100)

    try {
      const result = await window.api.loadClipboardItems({ limit: 200 })
      const allItems = result.items as Array<{
        id: string
        contentType: 'text' | 'image'
        textContent: string | null
        imageDescription: string | null
        labels: Array<{ id: string }>
      }>

      // Only unlabeled items
      const unlabeled = allItems.filter((i) => i.labels.length === 0).slice(0, limit)

      if (unlabeled.length === 0) {
        return { kind: 'success', message: '✅ All items are already labeled. Nothing to organize.' }
      }

      // Build digest for AI
      const digest = unlabeled.map((item, idx) => {
        const content = item.contentType === 'text'
          ? (item.textContent?.slice(0, 200) ?? '(empty)')
          : `[Image: ${item.imageDescription ?? 'no description'}]`
        return `${idx}: ${content}`
      }).join('\n')

      const response = await fetchAITransform(clipboardAutoOrganizeSystemPrompt, `Classify these ${unlabeled.length} clipboard items:\n\n${digest}`)

      // Parse AI response
      let parsed: { labels: Array<{ name: string; color: string }>; assignments: Record<string, string> }
      try {
        const jsonStr = response.replace(/```json\n?|\n?```/g, '').trim()
        parsed = JSON.parse(jsonStr)
      } catch {
        return { kind: 'error', message: 'AI returned invalid classification data. Try again.' }
      }

      if (!parsed.labels || !parsed.assignments) {
        return { kind: 'error', message: 'AI response missing labels or assignments.' }
      }

      // Create labels that don't exist yet
      const labelStore = useClipboardLabelStore.getState()
      const labelMap = new Map<string, { id: string; name: string; color: string; createdAt: string }>()

      for (const labelDef of parsed.labels) {
        const existing = labelStore.labels.find((l) => l.name.toLowerCase() === labelDef.name.toLowerCase())
        if (existing) {
          labelMap.set(labelDef.name, existing)
        } else {
          const color = /^#[0-9a-fA-F]{6}$/.test(labelDef.color) ? labelDef.color : '#6366f1'
          const created = await useClipboardLabelStore.getState().createLabel(labelDef.name, color)
          labelMap.set(labelDef.name, created)
        }
      }

      // Assign labels
      let assigned = 0
      const categoryCounts: Record<string, number> = {}

      for (const [idxStr, labelName] of Object.entries(parsed.assignments)) {
        const idx = parseInt(idxStr, 10)
        if (isNaN(idx) || idx >= unlabeled.length) continue
        const item = unlabeled[idx]
        const label = labelMap.get(labelName)
        if (!label) continue

        try {
          await useClipboardLabelStore.getState().addLabelToItem(item.id, label.id)
          useClipboardStore.getState().addLabelToItem(item.id, label)
          assigned++
          categoryCounts[labelName] = (categoryCounts[labelName] || 0) + 1
        } catch {
          // Continue on individual failures
        }
      }

      const breakdown = Object.entries(categoryCounts)
        .map(([name, count]) => `- **${name}**: ${count} item${count === 1 ? '' : 's'}`)
        .join('\n')

      return {
        kind: 'success',
        message: `✅ Auto-organized **${assigned}** items into **${Object.keys(categoryCounts).length}** categories:\n\n${breakdown}`,
      }
    } catch (e) {
      return { kind: 'error', message: `Auto-organize failed: ${e instanceof Error ? e.message : String(e)}` }
    }
  },
}

export default tool
