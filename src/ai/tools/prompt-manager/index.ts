import type { ToolModule } from '@/ai/tools/tools.types'

// Read tools
import listFolders from './read/listFolders'
import listPrompts from './read/listPrompts'
import searchPrompts from './read/searchPrompts'
import getCurrentContext from './read/getCurrentContext'

// Write tools — Folders
import createFolder from './write/createFolder'
import updateFolder from './write/updateFolder'
import deleteFolder from './write/deleteFolder'

// Write tools — Categories
import createCategory from './write/createCategory'
import updateCategory from './write/updateCategory'
import deleteCategory from './write/deleteCategory'

// Write tools — Prompts
import createPrompt from './write/createPrompt'
import updatePrompt from './write/updatePrompt'
import deletePrompt from './write/deletePrompt'
import movePrompt from './write/movePrompt'

// Write tools — Import
import importPrompt from './write/importPrompt'
import importFolder from './write/importFolder'

// Navigation tools
import setViewMode from './navigation/setViewMode'

const ALL_TOOLS: ToolModule[] = [
  // Read
  listFolders,
  listPrompts,
  searchPrompts,
  getCurrentContext,
  // Write — Folders
  createFolder,
  updateFolder,
  deleteFolder,
  // Write — Categories
  createCategory,
  updateCategory,
  deleteCategory,
  // Write — Prompts
  createPrompt,
  updatePrompt,
  deletePrompt,
  movePrompt,
  // Import
  importPrompt,
  importFolder,
  // Navigation
  setViewMode,
]

/** Tool definitions array — sent to the AI API */
export const PROMPT_MANAGER_TOOL_DEFINITIONS = ALL_TOOLS.map((t) => t.definition)

/** Tool registry map — for dispatching tool calls by name */
export const PROMPT_MANAGER_TOOL_REGISTRY: Record<string, ToolModule> = Object.fromEntries(
  ALL_TOOLS.map((t) => [t.name, t]),
)
