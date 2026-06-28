import type { GitInvokeResponse, GitConflictAwareResult } from '../git.types'

export async function invokeGitCherryPickAbort(rootPath: string): Promise<GitConflictAwareResult> {
  const res = (await window.api.gitCherryPickAbort({ rootPath })) as GitInvokeResponse<GitConflictAwareResult>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to abort cherry-pick.')
  }
  return res.data
}
