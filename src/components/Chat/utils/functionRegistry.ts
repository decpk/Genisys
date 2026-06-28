interface FunctionMeta {
  name: string
  description: string
  safetyLevel: 'safe' | 'destructive'
}

const FUNCTION_REGISTRY: Map<string, FunctionMeta> = new Map([
  // ── Repo tools (read-only → safe) ────────────────────────────
  ['read_file', { name: 'read_file', description: 'Read file contents', safetyLevel: 'safe' }],
  ['list_directory', { name: 'list_directory', description: 'List directory contents', safetyLevel: 'safe' }],
  ['grep_search', { name: 'grep_search', description: 'Search for pattern in files', safetyLevel: 'safe' }],
  ['find_files', { name: 'find_files', description: 'Find files by pattern', safetyLevel: 'safe' }],
  ['list_repo_files', { name: 'list_repo_files', description: 'List all repo files', safetyLevel: 'safe' }],
  ['git_status', { name: 'git_status', description: 'Git status', safetyLevel: 'safe' }],
  ['git_log', { name: 'git_log', description: 'Git log', safetyLevel: 'safe' }],

  // ── Slash command tools ──────────────────────────────────────
  ['crawl_webpage', { name: 'crawl_webpage', description: 'Crawl and analyze a webpage', safetyLevel: 'destructive' }],
  ['attach_repo', { name: 'attach_repo', description: 'Attach a local repository', safetyLevel: 'destructive' }],
])

// Tools that have a local executor in the backend and can be auto-executed
// via the agentic tool loop without user confirmation.
const LOCALLY_EXECUTABLE_TOOLS = new Set([
  'crawl_webpage',
  'read_file',
  'list_directory',
  'grep_search',
  'find_files',
  'list_repo_files',
  'git_status',
  'git_log',
])

export function isRegisteredFunction(name: string): boolean {
  return FUNCTION_REGISTRY.has(name)
}

export function getFunctionMeta(name: string): FunctionMeta | null {
  return FUNCTION_REGISTRY.get(name) ?? null
}

export function shouldAutoExecute(name: string): boolean {
  const meta = FUNCTION_REGISTRY.get(name)
  return meta?.safetyLevel === 'safe'
}

export function isLocallyExecutable(name: string): boolean {
  return LOCALLY_EXECUTABLE_TOOLS.has(name)
}
