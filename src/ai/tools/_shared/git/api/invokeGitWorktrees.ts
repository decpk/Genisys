import type { GitInvokeResponse } from '../git.types'

export interface GitWorktreeEntry {
  path: string
  head: string
  branch: string
  isBare: boolean
}

/**
 * Lists all linked worktrees for the repository at `rootPath`. Wraps
 * `cmd_get_git_worktrees` which calls `git worktree list --porcelain`.
 */
export async function invokeGitWorktrees(rootPath: string): Promise<GitWorktreeEntry[]> {
  const res = (await window.api.getGitWorktrees({ rootPath })) as GitInvokeResponse<GitWorktreeEntry[]>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to list worktrees.')
  }
  return res.data
}
