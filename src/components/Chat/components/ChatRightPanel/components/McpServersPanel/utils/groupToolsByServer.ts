import type { McpToolItem, McpToolsMap } from '../McpServersPanel.types'

export function groupToolsByServer(tools: any[]): McpToolsMap {
  const grouped: McpToolsMap = {}

  for (const tool of tools) {
    const fn = tool.function
    if (!fn?.name) continue

    const prefixed: string = fn.name
    if (!prefixed.startsWith('mcp__')) continue

    const rest = prefixed.slice(5)
    const sepIdx = rest.indexOf('__')
    if (sepIdx < 0) continue

    const serverName = rest.slice(0, sepIdx)
    const toolName = rest.slice(sepIdx + 2)

    if (!grouped[serverName]) grouped[serverName] = []

    const item: McpToolItem = {
      name: toolName,
      description: fn.description ?? '',
    }
    grouped[serverName].push(item)
  }

  return grouped
}
