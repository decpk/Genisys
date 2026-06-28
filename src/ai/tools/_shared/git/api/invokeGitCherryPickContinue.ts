import type { GitInvokeResponse, GitConflictAwareResult } from '../git.types'

export async function invokeGitCherryPickContinue(rootPath: string): Promise<GitConflictAwareResult> {
  const res = (await window.api.gitCherryPickContinue({ rootPath })) as GitInvokeResponse<GitConflictAwareResult>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to continue cherry-pick.')
  }
  return res.data
}
