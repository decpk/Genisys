import type { GitInvokeResponse, GitConflictAwareResult } from '../git.types'

export async function invokeGitRebaseContinue(rootPath: string): Promise<GitConflictAwareResult> {
  const res = (await window.api.gitRebaseContinue({ rootPath })) as GitInvokeResponse<GitConflictAwareResult>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to continue rebase.')
  }
  return res.data
}
