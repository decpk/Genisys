import type { GitInvokeResponse } from '../git.types'

interface GitBranchOutput {
  stdout: string
}

/** Delete a branch. Wraps `cmd_git_branch_delete`. */
export async function invokeGitBranchDelete(params: {
  rootPath: string
  name: string
  force?: boolean
}): Promise<string> {
  const res = (await window.api.gitBranchDelete({
    rootPath: params.rootPath,
    name: params.name,
    force: params.force,
  })) as GitInvokeResponse<GitBranchOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to delete branch.')
  }
  return res.data.stdout
}
