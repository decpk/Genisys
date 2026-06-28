import type { GitBranchInfo, GitInvokeResponse } from '../git.types'

/**
 * Returns the current branch name (or short SHA when detached) along
 * with a `detached` flag. Wraps `cmd_get_git_branch`.
 */
export async function invokeGitBranch(rootPath: string): Promise<GitBranchInfo> {
  const res = (await window.api.getGitBranch({ rootPath })) as GitInvokeResponse<GitBranchInfo>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to read git branch.')
  }
  return res.data
}
