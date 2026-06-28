import type { ToolModule } from '@/ai/tools/tools.types'

// Read tools
import browseFolder from './read/browseFolder'
import viewFile from './read/viewFile'
import listRepoHistory from './read/listRepoHistory'
import getCurrentContext from './read/getCurrentContext'

// Write tools — Navigation (placeholders)
import selectRepo from './write/selectRepo'
import navigateBack from './write/navigateBack'
import navigateForward from './write/navigateForward'
import toggleHiddenFiles from './write/toggleHiddenFiles'
import splitPane from './write/splitPane'
import closePane from './write/closePane'

// Write tools — History
import addRepoToHistory from './write/addRepoToHistory'
import removeRepoFromHistory from './write/removeRepoFromHistory'

// Git tools — shared factory wired with the most-recent local repo path
import { createExplorerGitTools } from './git/createExplorerGitTools'

const ALL_TOOLS: ToolModule[] = [
  // Read
  browseFolder,
  viewFile,
  listRepoHistory,
  getCurrentContext,
  // Write — Navigation
  selectRepo,
  navigateBack,
  navigateForward,
  toggleHiddenFiles,
  splitPane,
  closePane,
  // Write — History
  addRepoToHistory,
  removeRepoFromHistory,
  // Git (read + write)
  ...createExplorerGitTools(),
]

/** Tool definitions array — sent to the AI API */
export const PROJECT_EXPLORER_TOOL_DEFINITIONS = ALL_TOOLS.map((t) => t.definition)

/** Tool registry map — for dispatching tool calls by name */
export const PROJECT_EXPLORER_TOOL_REGISTRY: Record<string, ToolModule> = Object.fromEntries(
  ALL_TOOLS.map((t) => [t.name, t]),
)
