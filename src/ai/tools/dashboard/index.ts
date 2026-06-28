import type { ToolModule } from '@/ai/tools/tools.types'

// Read tools
import listProjects from './read/listProjects'
import listSnippets from './read/listSnippets'
import getCurrentContext from './read/getCurrentContext'

// Write tools — Projects
import addProject from './write/addProject'
import updateProject from './write/updateProject'
import removeProject from './write/removeProject'
import reorderProjects from './write/reorderProjects'
import setTileWidth from './write/setTileWidth'
import refreshProject from './write/refreshProject'
import refreshAll from './write/refreshAll'

// Write tools — Snippets
import createSnippet from './write/createSnippet'
import updateSnippet from './write/updateSnippet'
import deleteSnippet from './write/deleteSnippet'
import toggleSnippetFavorite from './write/toggleSnippetFavorite'

const ALL_TOOLS: ToolModule[] = [
  // Read
  listProjects,
  listSnippets,
  getCurrentContext,
  // Write — Projects
  addProject,
  updateProject,
  removeProject,
  reorderProjects,
  setTileWidth,
  refreshProject,
  refreshAll,
  // Write — Snippets
  createSnippet,
  updateSnippet,
  deleteSnippet,
  toggleSnippetFavorite,
]

/** Tool definitions array — sent to the AI provider */
export const DASHBOARD_TOOL_DEFINITIONS = ALL_TOOLS.map((t) => t.definition)

/** Tool registry map — for dispatching tool calls by name */
export const DASHBOARD_TOOL_REGISTRY: Record<string, ToolModule> =
  Object.fromEntries(ALL_TOOLS.map((t) => [t.name, t]))
