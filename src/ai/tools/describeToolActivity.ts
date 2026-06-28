/**
 * Humanize a tool invocation for display in the AI Assistant panel.
 *
 * Converts the tool name from snake_case to spaces, then appends a short
 * summary of the most relevant argument (file path, query, url, etc.)
 * so the user can see *what* the assistant is reading / listing /
 * searching rather than just *which* tool it is calling.
 *
 * Example: `code_read_file({ path: '/Users/foo/src/App.tsx' })`
 *   → `'code read file — App.tsx'`
 */
export function describeToolActivity(
  toolName: string,
  args?: unknown,
): string {
  const base = TOOL_ACTIVITY_LABELS[toolName] ?? toolName.replace(/_/g, ' ')
  if (!args || typeof args !== 'object') return base
  const target = pickTarget(args as Record<string, unknown>)
  if (!target) return base
  return `${base} — ${target}`
}

/**
 * Per-tool running labels. When a tool name is present here, its label is used
 * verbatim instead of the generic snake_case → spaces transform; the relevant
 * argument is still appended as `— target`. Tools not listed fall back to the
 * generic behavior, so adding entries here is purely additive.
 */
const TOOL_ACTIVITY_LABELS: Record<string, string> = {
  previewer_get_current_context: 'Reading Previewer context',
  previewer_list_previews: 'Listing previews',
  previewer_list_folders: 'Listing folders',
  previewer_open_url: 'Opening URL',
  previewer_save_preview: 'Saving preview',
  previewer_delete_preview: 'Deleting preview',
  previewer_create_folder: 'Creating folder',
  previewer_rename_folder: 'Renaming folder',
  previewer_delete_folder: 'Deleting folder',
  previewer_move_preview: 'Moving preview',
  previewer_import_bookmarks: 'Importing bookmarks',
  previewer_extract_urls_from_image: 'Extracting URLs from image',
  previewer_set_sort: 'Sorting previews',
  previewer_set_filter: 'Filtering previews',
  previewer_select_folder: 'Selecting folder',
}

const PATH_KEYS = [
  'path',
  'filePath',
  'file',
  'dirPath',
  'directory',
  'folder',
  'from',
  'to',
  'destination',
  'src',
  'source',
] as const

const QUERY_KEYS = [
  'query',
  'pattern',
  'searchTerm',
  'search',
  'q',
  'text',
] as const

const URL_KEYS = ['url', 'endpoint', 'href'] as const

const NAME_KEYS = ['title', 'name', 'id', 'tabId', 'noteId', 'bookId'] as const

const MAX_INLINE_VALUE = 48

function pickTarget(a: Record<string, unknown>): string | null {
  for (const key of PATH_KEYS) {
    const v = a[key]
    if (typeof v === 'string' && v.length > 0) return basename(v)
  }
  for (const key of QUERY_KEYS) {
    const v = a[key]
    if (typeof v === 'string' && v.length > 0) {
      return truncate(JSON.stringify(v).slice(1, -1))
    }
  }
  for (const key of URL_KEYS) {
    const v = a[key]
    if (typeof v === 'string' && v.length > 0) return truncate(v)
  }
  for (const key of NAME_KEYS) {
    const v = a[key]
    if (typeof v === 'string' && v.length > 0) return truncate(v)
  }
  return null
}

function basename(p: string): string {
  // Strip trailing slashes, then take last segment. Falls back to the
  // full path when there is no separator (already a bare name).
  const trimmed = p.replace(/[\\/]+$/, '')
  const idx = Math.max(trimmed.lastIndexOf('/'), trimmed.lastIndexOf('\\'))
  const tail = idx >= 0 ? trimmed.slice(idx + 1) : trimmed
  return truncate(tail || trimmed)
}

function truncate(s: string): string {
  return s.length > MAX_INLINE_VALUE ? `${s.slice(0, MAX_INLINE_VALUE)}…` : s
}
