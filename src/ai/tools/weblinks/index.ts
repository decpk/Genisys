import type { ToolModule } from '@/ai/tools/tools.types'

// Read tools
import getCurrentContext from './read/getCurrentContext'
import listPreviews from './read/listPreviews'
import listFolders from './read/listFolders'

// Write tools — previews
import openUrl from './write/openUrl'
import savePreview from './write/savePreview'
import deletePreview from './write/deletePreview'
import movePreview from './write/movePreview'

// Write tools — folders
import createFolder from './write/createFolder'
import renameFolder from './write/renameFolder'
import deleteFolder from './write/deleteFolder'

// Write tools — bookmark import
import importBookmarks from './write/importBookmarks'

// Write tools — screenshot URL extraction
import extractUrlsFromImage from './write/extractUrlsFromImage'

// Write tools — view preferences
import setSort from './write/setSort'
import setFilter from './write/setFilter'
import selectFolder from './write/selectFolder'

const ALL_TOOLS: ToolModule[] = [
  // Read
  getCurrentContext,
  listPreviews,
  listFolders,
  // Write — previews
  openUrl,
  savePreview,
  deletePreview,
  movePreview,
  // Write — folders
  createFolder,
  renameFolder,
  deleteFolder,
  // Write — bookmark import
  importBookmarks,
  // Write — screenshot URL extraction
  extractUrlsFromImage,
  // Write — view preferences
  setSort,
  setFilter,
  selectFolder,
]

/** Tool definitions array — sent to the AI API */
export const WEBLINKS_TOOL_DEFINITIONS = ALL_TOOLS.map((t) => t.definition)

/** Tool registry map — for dispatching tool calls by name */
export const WEBLINKS_TOOL_REGISTRY: Record<string, ToolModule> = Object.fromEntries(
  ALL_TOOLS.map((t) => [t.name, t]),
)

/**
 * Names of tools that are safe in read-only assistant modes (`plan` / `ask`).
 * Includes pure reads plus non-destructive fetch/open and view-preference tools
 * that do not mutate the saved collection.
 */
export const WEBLINKS_READ_TOOL_NAMES: string[] = [
  'previewer_get_current_context',
  'previewer_list_previews',
  'previewer_list_folders',
  'previewer_open_url',
  'previewer_set_sort',
  'previewer_set_filter',
  'previewer_select_folder',
]
