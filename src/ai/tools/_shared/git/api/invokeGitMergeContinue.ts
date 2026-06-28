import type { GitInvokeResponse, GitConflictAwareResult } from '../git.types'

export async function invokeGitMergeContinue(rootPath: string): Promise<GitConflictAwareResult> {
  const res = (await window.api.gitMergeContinue({ rootPath })) as GitInvokeResponse<GitConflictAwareResult>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to continue merge.')
  }
  return res.data
}
