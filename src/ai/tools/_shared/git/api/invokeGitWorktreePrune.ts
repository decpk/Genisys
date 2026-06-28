import type { GitInvokeResponse } from '../git.types'

interface WorktreePruneOutput {
  stdout: string
}

export async function invokeGitWorktreePrune(rootPath: string): Promise<string> {
  const res = (await window.api.gitWorktreePrune({ rootPath })) as GitInvokeResponse<WorktreePruneOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to prune worktrees.')
  }
  return res.data.stdout
}
