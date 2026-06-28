import type { GitInvokeResponse } from '../git.types'

interface GitBranchOutput {
  stdout: string
}

/** Rename a branch. Wraps `cmd_git_branch_rename`. `from` defaults to current. */
export async function invokeGitBranchRename(params: {
  rootPath: string
  from?: string
  to: string
  force?: boolean
}): Promise<string> {
  const res = (await window.api.gitBranchRename({
    rootPath: params.rootPath,
    from: params.from,
    to: params.to,
    force: params.force,
  })) as GitInvokeResponse<GitBranchOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to rename branch.')
  }
  return res.data.stdout
}
