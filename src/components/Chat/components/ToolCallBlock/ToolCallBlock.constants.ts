import { Search, FileText, FolderOpen, GitBranch, Plug } from 'lucide-react'

export const TOOL_ICONS: Record<string, React.ElementType> = {
  read_file: FileText,
  list_directory: FolderOpen,
  grep_search: Search,
  find_files: Search,
  list_repo_files: FolderOpen,
  git_status: GitBranch,
  git_log: GitBranch,
}

export const TOOL_LABELS: Record<string, string> = {
  read_file: 'Read file',
  list_directory: 'List directory',
  grep_search: 'Search',
  find_files: 'Find files',
  list_repo_files: 'List repo files',
  git_status: 'Git status',
  git_log: 'Git log',
}

/** MCP tools use "mcp__server__toolName" naming. Extract a readable label. */
export function getMcpToolLabel(toolName: string): string {
  const parts = toolName.replace('mcp__', '').split('__')
  if (parts.length === 2) return `${parts[0]}: ${parts[1]}`
  return toolName
}

/** Get the icon for a tool, with MCP fallback. */
export function getToolIcon(toolName: string): React.ElementType {
  if (toolName.startsWith('mcp__')) return Plug
  return TOOL_ICONS[toolName] || Search
}

/** Get the label for a tool, with MCP fallback. */
export function getToolLabel(toolName: string): string {
  if (toolName.startsWith('mcp__')) return getMcpToolLabel(toolName)
  return TOOL_LABELS[toolName] || toolName
}

export function formatArgs(toolName: string, args: Record<string, unknown>): string {
  switch (toolName) {
    case 'read_file':
      return String(args.file_path || '')
    case 'list_directory':
      return String(args.path || '.')
    case 'grep_search':
      return `"${args.pattern || ''}"${args.include_pattern ? ` in ${args.include_pattern}` : ''}`
    case 'find_files':
      return String(args.pattern || '')
    case 'list_repo_files':
      return args.max_results ? `(max ${args.max_results})` : ''
    case 'git_status':
      return ''
    case 'git_log':
      return args.max_count ? `(last ${args.max_count})` : ''
    default:
      return JSON.stringify(args)
  }
}