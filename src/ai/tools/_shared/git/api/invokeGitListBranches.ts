import type { GitBranchesData, GitInvokeResponse } from '../git.types'

/**
 * List local + remote branches. Local entries include `upstream` and
 * `isCurrent`; remote entries are name-only. Wraps `cmd_git_get_branches`.
 */
export async function invokeGitListBranches(rootPath: string): Promise<GitBranchesData> {
  const res = (await window.api.gitGetBranches({ rootPath })) as GitInvokeResponse<GitBranchesData>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to list branches.')
  }
  return res.data
}
