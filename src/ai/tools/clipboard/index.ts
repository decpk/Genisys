import type { ToolModule } from '@/ai/tools/tools.types'

// Read tools
import getItems from './read/getItems'
import getStats from './read/getStats'
import searchItems from './read/searchItems'
import getCurrentContext from './read/getCurrentContext'
import getTimeline from './read/getTimeline'

// Write tools — Items
import copyItem from './write/copyItem'
import deleteItem from './write/deleteItem'
import clearAll from './write/clearAll'
import updateText from './write/updateText'
import openPreview from './write/openPreview'
import setFilter from './write/setFilter'
import setSearch from './write/setSearch'

// Write tools — Images
import analyzeImage from './write/analyzeImage'
import updateImageDescription from './write/updateImageDescription'

// Label tools
import listLabels from './label/listLabels'
import createLabel from './label/createLabel'
import updateLabel from './label/updateLabel'
import deleteLabel from './label/deleteLabel'
import addLabelToItem from './label/addLabelToItem'
import removeLabelFromItem from './label/removeLabelFromItem'

// AI-powered tools
import workSummary from './ai/workSummary'
import detectSecrets from './ai/detectSecrets'
import autoOrganize from './ai/autoOrganize'
import generateFromContext from './ai/generateFromContext'
import findRelated from './ai/findRelated'
import extractActionItems from './ai/extractActionItems'
import smartCompose from './ai/smartCompose'

const READ_TOOLS: ToolModule[] = [
  getItems,
  getStats,
  searchItems,
  getCurrentContext,
  getTimeline,
]

const ACTION_TOOLS: ToolModule[] = [
  copyItem,
  deleteItem,
  clearAll,
  updateText,
  openPreview,
  setFilter,
  setSearch,
  analyzeImage,
  updateImageDescription,
]

const LABEL_TOOLS: ToolModule[] = [
  listLabels,
  createLabel,
  updateLabel,
  deleteLabel,
  addLabelToItem,
  removeLabelFromItem,
]

const AI_TOOLS: ToolModule[] = [
  workSummary,
  detectSecrets,
  autoOrganize,
  generateFromContext,
  findRelated,
  extractActionItems,
  smartCompose,
]

const ALL_TOOLS: ToolModule[] = [
  ...READ_TOOLS,
  ...ACTION_TOOLS,
  ...LABEL_TOOLS,
  ...AI_TOOLS,
]

import { MEMORY_TOOL_DEFINITIONS, MEMORY_TOOL_REGISTRY } from '@/ai/tools/memory'

/** Tool definitions array — sent to the AI API */
export const CLIPBOARD_TOOL_DEFINITIONS = [
  ...ALL_TOOLS.map((t) => t.definition),
  ...MEMORY_TOOL_DEFINITIONS,
]

/** Per-category tool definitions — for tools info popover */
export const CLIPBOARD_READ_DEFINITIONS = READ_TOOLS.map((t) => t.definition)
export const CLIPBOARD_ACTION_DEFINITIONS = ACTION_TOOLS.map((t) => t.definition)
export const CLIPBOARD_LABEL_DEFINITIONS = LABEL_TOOLS.map((t) => t.definition)
export const CLIPBOARD_AI_DEFINITIONS = AI_TOOLS.map((t) => t.definition)

/** Tool registry map — for dispatching tool calls by name */
export const CLIPBOARD_TOOL_REGISTRY: Record<string, ToolModule> = {
  ...Object.fromEntries(ALL_TOOLS.map((t) => [t.name, t])),
  ...MEMORY_TOOL_REGISTRY,
}

/**
 * Names of tools considered safe in read-only AI assistant modes
 * (`plan` and `ask`). Anything not listed here is filtered out of the
 * tool list and refused at dispatch time when the panel is not in
 * `agent` mode. Derived from the `READ_TOOLS` array above.
 */
export const CLIPBOARD_READ_TOOL_NAMES: ReadonlySet<string> = new Set<string>([
  ...READ_TOOLS.map((t) => t.name),
  'memory_view',
])
