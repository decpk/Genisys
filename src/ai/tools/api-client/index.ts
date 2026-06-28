import type { ToolModule } from '@/ai/tools/tools.types'

// Read tools
import listCollections from './read/listCollections'
import getRequest from './read/getRequest'
import listEnvironments from './read/listEnvironments'
import getHistory from './read/getHistory'
import getCurrentContext from './read/getCurrentContext'
import getResponse from './read/getResponse'

// Write tools — Collections
import createCollection from './write/createCollection'
import updateCollection from './write/updateCollection'
import deleteCollection from './write/deleteCollection'

// Write tools — Folders
import createFolder from './write/createFolder'
import updateFolder from './write/updateFolder'
import deleteFolder from './write/deleteFolder'

// Write tools — Requests
import createRequest from './write/createRequest'
import updateRequest from './write/updateRequest'
import deleteRequest from './write/deleteRequest'
import duplicateRequest from './write/duplicateRequest'
import sendRequest from './write/sendRequest'

// Write tools — Environments
import createEnvironment from './write/createEnvironment'
import updateEnvironment from './write/updateEnvironment'
import deleteEnvironment from './write/deleteEnvironment'
import setActiveEnvironment from './write/setActiveEnvironment'

// Write tools — Environment Variables
import addEnvVariable from './write/addEnvVariable'
import updateEnvVariable from './write/updateEnvVariable'
import removeEnvVariable from './write/removeEnvVariable'

// Write tools — Import & History
import importCurl from './write/importCurl'
import importRequest from './write/importRequest'
import clearHistory from './write/clearHistory'

// Write tools — Navigation, selection & response
import setSidebarTab from './write/setSidebarTab'
import setSort from './write/setSort'
import setActiveRequest from './write/setActiveRequest'
import setActiveCollection from './write/setActiveCollection'
import copyResponse from './write/copyResponse'

const ALL_TOOLS: ToolModule[] = [
  // Read
  listCollections,
  getRequest,
  listEnvironments,
  getHistory,
  getCurrentContext,
  getResponse,
  // Write — Collections
  createCollection,
  updateCollection,
  deleteCollection,
  // Write — Folders
  createFolder,
  updateFolder,
  deleteFolder,
  // Write — Requests
  createRequest,
  updateRequest,
  deleteRequest,
  duplicateRequest,
  sendRequest,
  // Write — Environments
  createEnvironment,
  updateEnvironment,
  deleteEnvironment,
  setActiveEnvironment,
  // Write — Environment Variables
  addEnvVariable,
  updateEnvVariable,
  removeEnvVariable,
  // Import & History
  importCurl,
  importRequest,
  clearHistory,
  // Navigation, selection & response
  setSidebarTab,
  setSort,
  setActiveRequest,
  setActiveCollection,
  copyResponse,
]

/** Tool definitions array — sent to the AI API */
export const API_CLIENT_TOOL_DEFINITIONS = ALL_TOOLS.map((t) => t.definition)

/** Tool registry map — for dispatching tool calls by name */
export const API_CLIENT_TOOL_REGISTRY: Record<string, ToolModule> = Object.fromEntries(
  ALL_TOOLS.map((t) => [t.name, t]),
)

/**
 * Names of tools that are safe in read-only assistant modes (`plan` / `ask`).
 * Includes pure reads plus navigation/selection/view-preference tools that do
 * not mutate API data.
 */
export const API_CLIENT_READ_TOOL_NAMES: string[] = [
  'apiclient_list_collections',
  'apiclient_get_request',
  'apiclient_list_environments',
  'apiclient_get_history',
  'apiclient_get_current_context',
  'apiclient_get_response',
  'apiclient_set_sidebar_tab',
  'apiclient_set_sort',
  'apiclient_set_active_request',
  'apiclient_set_active_collection',
  'apiclient_set_active_environment',
  'apiclient_copy_response',
]
