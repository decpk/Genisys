import type { GitWorktreeEntry } from '../api/invokeGitWorktrees'

/**
 * Render the worktree list as an aligned text table suitable for LLM
 * consumption. Includes a `*` marker for bare worktrees.
 */
export function formatWorktreeList(entries: GitWorktreeEntry[]): string {
  if (entries.length === 0) return 'No linked worktrees.'
  const rows = entries.map((w) => ({
    marker: w.isBare ? '(bare)' : '      ',
    branch: w.branch || '(detached)',
    head: (w.head || '').slice(0, 12),
    path: w.path,
  }))
  const wBranch = Math.max(6, ...rows.map((r) => r.branch.length))
  const wHead = 12
  const lines = rows.map(
    (r) => `${r.marker}  ${r.branch.padEnd(wBranch)}  ${r.head.padEnd(wHead)}  ${r.path}`
  )
  return lines.join('\n')
}
