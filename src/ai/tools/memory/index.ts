import type { ToolModule } from '@/ai/tools/tools.types'

import view from './view'
import create from './create'
import strReplace from './strReplace'
import insert from './insert'
import remove from './remove'
import rename from './rename'

const ALL_MEMORY_TOOLS: ToolModule[] = [view, create, strReplace, insert, remove, rename]

export const MEMORY_TOOL_DEFINITIONS = ALL_MEMORY_TOOLS.map((t) => t.definition)
export const MEMORY_TOOL_REGISTRY: Record<string, ToolModule> = Object.fromEntries(
  ALL_MEMORY_TOOLS.map((t) => [t.name, t]),
)
