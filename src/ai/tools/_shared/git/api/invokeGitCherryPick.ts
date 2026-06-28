import type { GitInvokeResponse, GitConflictAwareResult } from '../git.types'

export async function invokeGitCherryPick(params: {
  rootPath: string
  commits: string[]
  noCommit?: boolean
}): Promise<GitConflictAwareResult> {
  const res = (await window.api.gitCherryPick({
    rootPath: params.rootPath,
    commits: params.commits,
    noCommit: params.noCommit,
  })) as GitInvokeResponse<GitConflictAwareResult>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to cherry-pick.')
  }
  return res.data
}
