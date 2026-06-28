import type { RequestStatus } from '@/store/debug-store'

export function formatTimestamp(ms: number): string {
  return new Date(ms).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  })
}

export function formatDuration(ms: number | null): string {
  if (ms === null) return '—'
  if (ms < 1) return '<1ms'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

export function getChannelAppSource(channel: string): string {
  if (channel.includes('repo_items') || channel.includes('local_repo') ||
      channel.startsWith('get-repo') || channel.startsWith('get-local') ||
      channel.includes('explorer'))
    return 'Explorer'
  if (channel.includes('chat') || channel.includes('conversation') ||
      channel.includes('tool_calls'))
    return 'Chat'
  if (channel.includes('research'))
    return 'Research'
  if (channel.includes('dashboard')) return 'Dashboard'
  if (channel.includes('settings') || channel.includes('app_data') || channel.includes('app-data'))
    return 'Settings'
  if (channel.includes('history')) return 'History'
  if (channel.includes('library') || channel.includes('book') || channel.includes('chapter') ||
      channel.includes('bookmark'))
    return 'Library'
  if (channel.includes('prompt') || channel.includes('pm_'))
    return 'Prompts'
  if (channel.includes('snippet'))
    return 'Snippets'
  if (channel.includes('zoom') ||
      channel.includes('delete_all') || channel.includes('reset_all'))
    return 'System'
  if (channel.includes('git'))
    return 'Git'
  if (channel.includes('execute_raw_query') || channel.includes('get_table_names'))
    return 'DB Explorer'
  return 'Other'
}

export function formatJsonPreview(value: unknown): string {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export function getStatusLabel(status: RequestStatus): string {
  if (status === 'pending') return '⏳ Pending'
  if (status === 'success') return '✓ Success'
  return '✕ Error'
}

// ── Command / API reconstruction ─────────────────────────────────────

interface CommandInfo {
  /** e.g. "AI API", "HTTP", "SQLite", "File System", "Git CLI" */
  type: string
  /** Human-readable command or URL that was called */
  command: string
}

function p(args: unknown[]): Record<string, unknown> {
  return (args[0] ?? {}) as Record<string, unknown>
}

export function reconstructCommand(channel: string, args: unknown[]): CommandInfo {
  const params = p(args)
  const org = (params.organization as string) ?? ''
  const project = (params.project ?? params.projectId ?? '') as string
  const repo = (params.repository ?? params.repositoryId ?? '') as string
  const prId = (params.pullRequestId ?? '') as string | number

  switch (channel) {
    // ── AI API (BYOK — OpenAI-compatible) ──────────────────────
    case 'chat-send-message':
      return {
        type: 'AI API',
        command: `POST {baseUrl}/chat/completions (model: ${(params.model as string) ?? 'default'}, stream: true)`
      }
    case 'chat-abort-stream':
      return { type: 'AI API', command: `Abort stream ${params.streamId}` }

    // ── SQLite ─────────────────────────────────────────────────
    case 'load-history':
    case 'load-all-history':
      return { type: 'SQLite', command: 'SELECT * FROM reviewer_history ...' }
    case 'save-history-entry':
      return { type: 'SQLite', command: 'INSERT OR REPLACE INTO reviewer_history ...' }
    case 'remove-history-entry':
      return {
        type: 'SQLite',
        command: `DELETE FROM reviewer_history WHERE pull_request_id = ${prId}`
      }
    case 'clear-history':
      return { type: 'SQLite', command: 'DELETE FROM reviewer_history' }
    case 'load-chat-history':
      return { type: 'SQLite', command: 'SELECT * FROM conversations ORDER BY updated_at DESC' }
    case 'save-chat-conversation':
      return { type: 'SQLite', command: 'INSERT OR REPLACE INTO conversations ...' }
    case 'remove-chat-conversation':
      return {
        type: 'SQLite',
        command: `DELETE FROM conversations WHERE id = ${params.conversationId ?? args[0]}`
      }
    case 'clear-chat-history':
      return { type: 'SQLite', command: 'DELETE FROM conversations' }
    case 'load-explorer-history':
      return {
        type: 'SQLite',
        command: 'SELECT * FROM explorer_history ORDER BY last_opened_at DESC'
      }
    case 'save-explorer-repo':
      return { type: 'SQLite', command: 'INSERT OR REPLACE INTO explorer_history ...' }
    case 'remove-explorer-repo':
      return { type: 'SQLite', command: 'DELETE FROM explorer_history WHERE ...' }
    case 'clear-explorer-history':
      return { type: 'SQLite', command: 'DELETE FROM explorer_history' }
    case 'load-app-data':
      return { type: 'File', command: 'Read app-data.json' }
    case 'save-app-data':
      return { type: 'File', command: 'Write app-data.json' }
    case 'load-dashboard-projects':
      return { type: 'SQLite', command: 'SELECT * FROM dashboard_projects' }
    case 'save-dashboard-projects':
      return { type: 'SQLite', command: 'DELETE + INSERT INTO dashboard_projects ...' }

    // ── File System ────────────────────────────────────────────
    case 'load-projects':
      return { type: 'File System', command: 'Read projects.json manifest' }
    case 'create-project':
      return { type: 'File System', command: `Create project "${params.name}"` }
    case 'delete-project':
      return { type: 'File System', command: `Delete project ${params.projectId}` }
    case 'rename-project':
      return {
        type: 'File System',
        command: `Rename project ${params.projectId} → "${params.name}"`
      }
    case 'set-active-project':
      return { type: 'File System', command: `Set active project ${params.projectId}` }
    case 'load-settings':
      return {
        type: 'File System',
        command: `Read settings.json for project ${params.projectId ?? args[0]}`
      }
    case 'save-settings':
      return {
        type: 'File System',
        command: `Write settings.json for project ${params.projectId ?? args[0]}`
      }
    case 'select-local-repo':
      return { type: 'File System', command: 'Open directory picker dialog' }
    case 'get-local-repo-items':
      return { type: 'File System', command: `readdir(${params.rootPath}/${params.path ?? ''})` }
    case 'get-local-file-content':
      return { type: 'File System', command: `readFile(${params.rootPath}/${params.filePath})` }
    case 'get-local-media-data-url':
      return {
        type: 'File System',
        command: `readFile(${params.rootPath}/${params.filePath}) → data URL`
      }

    // ── Git CLI ────────────────────────────────────────────────
    case 'get-git-status':
      return { type: 'Git CLI', command: `git status --porcelain -uall (in ${params.rootPath})` }
    case 'get-git-log':
      return {
        type: 'Git CLI',
        command: `git log --max-count=${params.maxCount ?? 30} --skip=${params.skip ?? 0} --no-merges`
      }
    case 'get-git-worktrees':
      return { type: 'Git CLI', command: `git worktree list --porcelain (in ${params.rootPath})` }
    case 'is-local-git-repo':
      return {
        type: 'Git CLI',
        command: `git rev-parse --is-inside-work-tree (in ${params.rootPath})`
      }
    case 'get-local-file-git-history':
      return { type: 'Git CLI', command: `git log --follow -50 -- ${params.filePath}` }
    case 'get-local-file-at-commit':
      return { type: 'Git CLI', command: `git show ${params.commitHash}:${params.filePath}` }

    case 'cmd_execute_raw_query':
      return { type: 'SQLite', command: `${(params.query as string) ?? 'raw query'}` }
    case 'cmd_get_table_names':
      return { type: 'SQLite', command: "SELECT name FROM sqlite_master WHERE type='table'" }

    // ── cmd_* Tauri commands ───────────────────────────────────

    // AI API (BYOK — OpenAI-compatible)
    case 'cmd_chat_send_message':
      return { type: 'AI API', command: `POST {baseUrl}/chat/completions (model: ${(params.model as string) ?? 'default'}, stream: true)` }
    case 'cmd_research_send_query':
      return { type: 'AI API', command: `POST {baseUrl}/chat/completions (research query, stream: true)` }

    // SQLite — reviewer_history
    case 'cmd_load_history':
    case 'cmd_load_all_history':
      return { type: 'SQLite [reviewer_history]', command: 'SELECT * FROM reviewer_history ORDER BY viewed_at DESC' }
    case 'cmd_save_history_entry':
      return { type: 'SQLite [reviewer_history]', command: 'INSERT OR REPLACE INTO reviewer_history (...)' }
    case 'cmd_remove_history_entry':
      return { type: 'SQLite [reviewer_history]', command: `DELETE FROM reviewer_history WHERE pull_request_id = ${prId}` }
    case 'cmd_clear_history':
      return { type: 'SQLite [reviewer_history]', command: 'DELETE FROM reviewer_history' }

    // SQLite — conversations / chat_messages
    case 'cmd_load_chat_history':
      return { type: 'SQLite [conversations]', command: 'SELECT * FROM conversations ORDER BY updated_at DESC' }
    case 'cmd_load_chat_list':
      return { type: 'SQLite [conversations]', command: 'SELECT id, title, updated_at FROM conversations ORDER BY updated_at DESC' }
    case 'cmd_save_chat_conversation':
      return { type: 'SQLite [conversations, chat_messages]', command: 'INSERT OR REPLACE INTO conversations (...) + DELETE/INSERT chat_messages' }
    case 'cmd_remove_chat_conversation':
      return { type: 'SQLite [conversations]', command: `DELETE FROM conversations WHERE id = '${params.conversationId ?? args[0]}'` }
    case 'cmd_clear_chat_history':
      return { type: 'SQLite [conversations]', command: 'DELETE FROM conversations' }
    case 'cmd_load_conversation_messages':
      return { type: 'SQLite [chat_messages]', command: `SELECT * FROM chat_messages WHERE conversation_id = '${params.conversationId ?? '?'}' ORDER BY created_at` }
    case 'cmd_append_chat_message':
      return { type: 'SQLite [chat_messages]', command: 'INSERT INTO chat_messages (...)' }

    // SQLite — tool_calls
    case 'cmd_load_tool_calls':
      return { type: 'SQLite [tool_calls]', command: `SELECT * FROM tool_calls WHERE conversation_id = '${params.conversationId ?? '?'}'` }
    case 'cmd_save_tool_calls':
      return { type: 'SQLite [tool_calls]', command: 'INSERT OR REPLACE INTO tool_calls (...)' }

    // SQLite — explorer_history
    case 'cmd_load_explorer_history':
      return { type: 'SQLite [explorer_history]', command: 'SELECT * FROM explorer_history ORDER BY last_opened_at DESC' }
    case 'cmd_save_explorer_repo':
      return { type: 'SQLite [explorer_history]', command: 'INSERT OR REPLACE INTO explorer_history (...)' }
    case 'cmd_remove_explorer_repo':
      return { type: 'SQLite [explorer_history]', command: 'DELETE FROM explorer_history WHERE ...' }
    case 'cmd_clear_explorer_history':
      return { type: 'SQLite [explorer_history]', command: 'DELETE FROM explorer_history' }

    // SQLite — dashboard_projects
    case 'cmd_load_dashboard_projects':
      return { type: 'SQLite [dashboard_projects]', command: 'SELECT * FROM dashboard_projects' }
    case 'cmd_save_dashboard_projects':
      return { type: 'SQLite [dashboard_projects]', command: 'DELETE + INSERT INTO dashboard_projects (...)' }

    // SQLite — prompts
    case 'cmd_load_prompts':
      return { type: 'SQLite [prompts]', command: 'SELECT * FROM prompts ORDER BY updated_at DESC' }
    case 'cmd_save_prompt':
      return { type: 'SQLite [prompts]', command: 'INSERT OR REPLACE INTO prompts (...)' }
    case 'cmd_remove_prompt':
      return { type: 'SQLite [prompts]', command: 'DELETE FROM prompts WHERE id = ?' }
    case 'cmd_toggle_prompt_favorite':
      return { type: 'SQLite [prompts]', command: 'UPDATE prompts SET is_favorite = NOT is_favorite WHERE id = ?' }
    case 'cmd_increment_prompt_usage':
      return { type: 'SQLite [prompts]', command: 'UPDATE prompts SET usage_count = usage_count + 1 WHERE id = ?' }

    // SQLite — snippets
    case 'cmd_load_snippets':
      return { type: 'SQLite [snippets]', command: 'SELECT * FROM snippets ORDER BY updated_at DESC' }
    case 'cmd_save_snippet':
      return { type: 'SQLite [snippets]', command: 'INSERT OR REPLACE INTO snippets (...)' }
    case 'cmd_remove_snippet':
      return { type: 'SQLite [snippets]', command: 'DELETE FROM snippets WHERE id = ?' }
    case 'cmd_toggle_snippet_favorite':
      return { type: 'SQLite [snippets]', command: 'UPDATE snippets SET is_favorite = NOT is_favorite WHERE id = ?' }

    // SQLite — books / chapters / bookmarks
    case 'cmd_load_books':
      return { type: 'SQLite [books]', command: 'SELECT * FROM books ORDER BY updated_at DESC' }
    case 'cmd_save_book':
      return { type: 'SQLite [books]', command: 'INSERT OR REPLACE INTO books (...)' }
    case 'cmd_remove_book':
      return { type: 'SQLite [books]', command: 'DELETE FROM books WHERE id = ?' }
    case 'cmd_load_book_with_chapters':
      return { type: 'SQLite [books, chapters]', command: 'SELECT book + chapters WHERE book_id = ?' }
    case 'cmd_load_chapter_content':
      return { type: 'SQLite [chapters]', command: 'SELECT content FROM chapters WHERE id = ?' }
    case 'cmd_save_chapter':
      return { type: 'SQLite [chapters]', command: 'INSERT OR REPLACE INTO chapters (...)' }
    case 'cmd_remove_chapter':
      return { type: 'SQLite [chapters]', command: 'DELETE FROM chapters WHERE id = ?' }
    case 'cmd_load_bookmarks':
      return { type: 'SQLite [bookmarks]', command: 'SELECT * FROM bookmarks' }
    case 'cmd_load_bookmarks_for_chapter':
      return { type: 'SQLite [bookmarks]', command: `SELECT * FROM bookmarks WHERE chapter_id = '${params.chapterId ?? '?'}'` }
    case 'cmd_save_bookmark':
      return { type: 'SQLite [bookmarks]', command: 'INSERT OR REPLACE INTO bookmarks (...)' }
    case 'cmd_remove_bookmark':
      return { type: 'SQLite [bookmarks]', command: 'DELETE FROM bookmarks WHERE id = ?' }

    // SQLite — prompt_manager (folders / categories / prompts)
    case 'cmd_pm_load_all':
      return { type: 'SQLite [pm_folders, pm_categories, pm_prompts]', command: 'SELECT * FROM pm_folders, pm_categories, pm_prompts' }
    case 'cmd_pm_save_folder':
      return { type: 'SQLite [pm_folders]', command: 'INSERT OR REPLACE INTO pm_folders (...)' }
    case 'cmd_pm_remove_folder':
      return { type: 'SQLite [pm_folders]', command: 'DELETE FROM pm_folders WHERE id = ?' }
    case 'cmd_pm_save_category':
      return { type: 'SQLite [pm_categories]', command: 'INSERT OR REPLACE INTO pm_categories (...)' }
    case 'cmd_pm_remove_category':
      return { type: 'SQLite [pm_categories]', command: 'DELETE FROM pm_categories WHERE id = ?' }
    case 'cmd_pm_save_prompt':
      return { type: 'SQLite [pm_prompts]', command: 'INSERT OR REPLACE INTO pm_prompts (...)' }
    case 'cmd_pm_remove_prompt':
      return { type: 'SQLite [pm_prompts]', command: 'DELETE FROM pm_prompts WHERE id = ?' }

    // SQLite — chat-attached sources (research_sources table)
    case 'cmd_load_research_sources':
      return { type: 'SQLite [research_sources]', command: `SELECT * FROM research_sources WHERE session_id = '${params.sessionId ?? '?'}'` }
    case 'cmd_save_research_source':
      return { type: 'SQLite [research_sources]', command: 'INSERT INTO research_sources (...)' }
    case 'cmd_remove_research_source':
      return { type: 'SQLite [research_sources]', command: 'DELETE FROM research_sources WHERE id = ?' }

    // File System (cmd_ variants)
    case 'cmd_load_settings':
      return { type: 'File', command: `Read settings.json for project ${params.projectId ?? args[0]}` }
    case 'cmd_save_settings':
      return { type: 'File', command: `Write settings.json for project ${params.projectId ?? args[0]}` }
    case 'cmd_load_app_data':
      return { type: 'File', command: 'Read app-data.json' }
    case 'cmd_save_app_data':
      return { type: 'File', command: 'Write app-data.json' }
    case 'cmd_write_binary_file':
      return { type: 'File', command: `Write binary file ${params.path ?? ''}` }
    case 'cmd_select_local_repo':
      return { type: 'File System', command: 'Open directory picker dialog' }
    case 'cmd_get_local_repo_items':
      return { type: 'File System', command: `readdir(${params.rootPath}/${params.path ?? ''})` }
    case 'cmd_get_local_file_content':
      return { type: 'File System', command: `readFile(${params.rootPath}/${params.filePath})` }
    case 'cmd_get_local_media_data_url':
      return { type: 'File System', command: `readFile(${params.rootPath}/${params.filePath}) → data URL` }
    case 'cmd_is_directory':
      return { type: 'File System', command: `is_dir(${params.path ?? ''})` }

    // Git CLI (cmd_ variants)
    case 'cmd_is_local_git_repo':
      return { type: 'Git CLI', command: `git rev-parse --is-inside-work-tree (in ${params.rootPath})` }
    case 'cmd_get_git_status':
      return { type: 'Git CLI', command: `git status --porcelain -uall (in ${params.rootPath})` }
    case 'cmd_get_git_log':
      return { type: 'Git CLI', command: `git log --max-count=${params.maxCount ?? 30} --skip=${params.skip ?? 0} --no-merges` }
    case 'cmd_get_git_worktrees':
      return { type: 'Git CLI', command: `git worktree list --porcelain (in ${params.rootPath})` }
    case 'cmd_get_local_file_git_history':
      return { type: 'Git CLI', command: `git log --follow -50 -- ${params.filePath}` }
    case 'cmd_get_local_file_at_commit':
      return { type: 'Git CLI', command: `git show ${params.commitHash}:${params.filePath}` }

    // System
    case 'cmd_zoom_in':
      return { type: 'System', command: 'Zoom in' }
    case 'cmd_zoom_out':
      return { type: 'System', command: 'Zoom out' }
    case 'cmd_zoom_reset':
      return { type: 'System', command: 'Reset zoom' }
    case 'cmd_get_zoom_level':
      return { type: 'System', command: 'Get current zoom level' }
    case 'cmd_delete_all_data':
      return { type: 'System', command: 'DELETE all data from all tables' }
    case 'cmd_reset_all_settings':
      return { type: 'System', command: 'Reset all settings to defaults' }

    default:
      return { type: 'IPC', command: `${channel}(${args.length > 0 ? '...' : ''})` }
  }
}

/** Size threshold above which syntax highlighting is skipped for performance */
export const LARGE_JSON_THRESHOLD = 50_000
