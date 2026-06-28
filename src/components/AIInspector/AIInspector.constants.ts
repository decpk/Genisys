import type { AIStatusFilterOption } from './AIInspector.types'

export const AI_STATUS_FILTERS: ReadonlyArray<AIStatusFilterOption> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'streaming', label: 'Streaming' },
  { value: 'success', label: 'Success' },
  { value: 'error', label: 'Error' }
] as const

export const AI_STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-500',
  streaming: 'text-blue-500',
  success: 'text-green-500',
  error: 'text-red-500'
} as const

export const AI_STATUS_BG: Record<string, string> = {
  pending: 'bg-yellow-500/10',
  streaming: 'bg-blue-500/10',
  success: 'bg-green-500/10',
  error: 'bg-red-500/10'
} as const

export const ORIGIN_APPS = ['All', 'Chat', 'Deep Research', 'Explorer', 'System'] as const

export const CHANNEL_LABELS: Record<string, string> = {
  cmd_chat_send_message: 'Chat Message',
  cmd_research_send_query: 'Research Query',
  cmd_crawl_webpage: 'Web Crawl',
  cmd_crawl_webpage_lite: 'Web Crawl (Lite)',
  cmd_execute_single_tool: 'Tool Execution',
  cmd_llm_json_completion: 'JSON Completion',
  cmd_explorer_ai_command: 'Explorer AI',
} as const
