import type { GitInvokeResponse } from '../git.types'

interface WorktreeAddOutput {
  stdout: string
}

export async function invokeGitWorktreeAdd(params: {
  rootPath: string
  path: string
  branch?: string
  newBranch?: string
}): Promise<string> {
  const res = (await window.api.gitWorktreeAdd({
    rootPath: params.rootPath,
    path: params.path,
    branch: params.branch,
    newBranch: params.newBranch,
  })) as GitInvokeResponse<WorktreeAddOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to add worktree.')
  }
  return res.data.stdout
}
