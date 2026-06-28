import type { GitConflictAwareResult } from '../git.types'
import { formatGitOutput } from './formatGitOutput'

/**
 * Render a `GitConflictAwareResult` for display back to the AI. When
 * the backend returns `status === 'conflict'`, we explicitly call
 * that out and include the stderr (git's conflict-marker output) so
 * the AI knows to call `git_operation_state` next and decide between
 * `*_continue` and `*_abort`.
 *
 * @param successHeadline One-line summary used when status === 'ok'.
 * @param conflictHint Tool-specific hint about what `*_continue` /
 *   `*_abort` calls are appropriate (e.g. "Run git_merge_continue
 *   after resolving, or git_merge_abort to bail.").
 */
export function formatConflictAwareResult(
  successHeadline: string,
  conflictHint: string,
  result: GitConflictAwareResult,
): string {
  if (result.status === 'conflict') {
    const body = [
      'STATUS: CONFLICT',
      conflictHint,
      '',
      result.stderr ? `stderr:\n${formatGitOutput(result.stderr)}` : '',
      result.stdout ? `stdout:\n${formatGitOutput(result.stdout)}` : '',
    ]
      .filter(Boolean)
      .join('\n')
    return body
  }
  const parts = [
    successHeadline,
    result.stdout ? formatGitOutput(result.stdout) : '',
    result.stderr ? formatGitOutput(result.stderr) : '',
  ].filter(Boolean)
  return parts.join('\n\n')
}
