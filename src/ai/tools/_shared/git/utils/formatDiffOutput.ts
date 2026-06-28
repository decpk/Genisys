import type { GitDiffData } from '../git.types'

/**
 * Format a `cmd_git_get_diff` payload as a side-by-side fenced code
 * block summary. We surface both `original` and `modified` so the LLM
 * can reason about the actual change without needing a unified diff —
 * the backend already does the heavy lifting.
 */
export function formatDiffOutput(file: string, side: string, data: GitDiffData): string {
  const fence = data.language || ''
  return [
    `## Diff for \`${file}\` (${side})`,
    '',
    '### Before',
    `\`\`\`${fence}`,
    data.original.length === 0 ? '(empty)' : data.original,
    '```',
    '',
    '### After',
    `\`\`\`${fence}`,
    data.modified.length === 0 ? '(empty)' : data.modified,
    '```',
  ].join('\n')
}
