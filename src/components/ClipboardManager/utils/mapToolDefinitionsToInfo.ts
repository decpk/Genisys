import type { AIToolInfo } from '@/right-panels/AIAssistantPanel'

interface ToolDefinition {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

export function mapToolDefinitionsToInfo(definitions: ToolDefinition[], category: string): AIToolInfo[] {
  return definitions.map((def) => ({
    name: def.function.name,
    description: def.function.description,
    category,
  }))
}
