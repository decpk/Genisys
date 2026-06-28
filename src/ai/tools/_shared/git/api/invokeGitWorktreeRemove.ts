import type { GitInvokeResponse } from '../git.types'

interface WorktreeRemoveOutput {
  stdout: string
}

export async function invokeGitWorktreeRemove(params: {
  rootPath: string
  path: string
  force?: boolean
}): Promise<string> {
  const res = (await window.api.gitWorktreeRemove({
    rootPath: params.rootPath,
    path: params.path,
    force: params.force,
  })) as GitInvokeResponse<WorktreeRemoveOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to remove worktree.')
  }
  return res.data.stdout
}
