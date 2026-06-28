import type { ToolModule } from '@/ai/tools/tools.types'

// Read tools
import listProjects from './read/listProjects'
import listServers from './read/listServers'
import listEndpoints from './read/listEndpoints'
import listVariants from './read/listVariants'
import getRequestLogs from './read/getRequestLogs'
import loadRequestLogs from './read/loadRequestLogs'
import checkPort from './read/checkPort'
import suggestPort from './read/suggestPort'
import getCurrentContext from './read/getCurrentContext'

// Write tools — Projects
import createProject from './write/createProject'
import updateProject from './write/updateProject'
import deleteProject from './write/deleteProject'

// Write tools — Servers
import createServer from './write/createServer'
import updateServer from './write/updateServer'
import deleteServer from './write/deleteServer'
import duplicateServer from './write/duplicateServer'
import startServer from './write/startServer'
import stopServer from './write/stopServer'
import stopAllServers from './write/stopAllServers'
import refreshRunningServers from './write/refreshRunningServers'

// Write tools — Endpoints
import createEndpoint from './write/createEndpoint'
import updateEndpoint from './write/updateEndpoint'
import deleteEndpoint from './write/deleteEndpoint'
import duplicateEndpoint from './write/duplicateEndpoint'

// Write tools — Variants
import createVariant from './write/createVariant'
import updateVariant from './write/updateVariant'
import deleteVariant from './write/deleteVariant'

// Write tools — Navigation / selection
import selectServer from './write/selectServer'
import selectEndpoint from './write/selectEndpoint'

// Utility
import clearLogs from './utility/clearLogs'
import exportLogs from './utility/exportLogs'

const ALL_TOOLS: ToolModule[] = [
  // Read
  listProjects,
  listServers,
  listEndpoints,
  listVariants,
  getRequestLogs,
  loadRequestLogs,
  checkPort,
  suggestPort,
  getCurrentContext,
  // Write — Projects
  createProject,
  updateProject,
  deleteProject,
  // Write — Servers
  createServer,
  updateServer,
  deleteServer,
  duplicateServer,
  startServer,
  stopServer,
  stopAllServers,
  refreshRunningServers,
  // Write — Endpoints
  createEndpoint,
  updateEndpoint,
  deleteEndpoint,
  duplicateEndpoint,
  // Write — Variants
  createVariant,
  updateVariant,
  deleteVariant,
  // Write — Navigation / selection
  selectServer,
  selectEndpoint,
  // Utility
  clearLogs,
  exportLogs,
]

/** Tool definitions array — sent to the AI API */
export const MOCKSERVER_TOOL_DEFINITIONS = ALL_TOOLS.map((t) => t.definition)

/** Tool registry map — for dispatching tool calls by name */
export const MOCKSERVER_TOOL_REGISTRY: Record<string, ToolModule> = Object.fromEntries(
  ALL_TOOLS.map((t) => [t.name, t]),
)

/**
 * Names of tools considered safe in "read"/"ask" mode — read-only tools plus
 * navigation/selection tools that only change UI focus (no data mutation).
 */
export const MOCKSERVER_READ_TOOL_NAMES: string[] = [
  'mockserver_list_projects',
  'mockserver_list_servers',
  'mockserver_list_endpoints',
  'mockserver_list_variants',
  'mockserver_get_request_logs',
  'mockserver_load_request_logs',
  'mockserver_check_port',
  'mockserver_suggest_port',
  'mockserver_get_current_context',
  'mockserver_select_server',
  'mockserver_select_endpoint',
]
