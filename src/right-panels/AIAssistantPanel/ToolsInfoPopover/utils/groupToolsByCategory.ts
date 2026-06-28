import type { AIToolInfo } from '../../AIAssistantPanel.types'

export function groupToolsByCategory(tools: AIToolInfo[]): Map<string, AIToolInfo[]> {
  const groups = new Map<string, AIToolInfo[]>()

  for (const tool of tools) {
    const category = tool.category ?? 'General'
    const existing = groups.get(category)
    if (existing) {
      existing.push(tool)
    } else {
      groups.set(category, [tool])
    }
  }

  return groups
}
