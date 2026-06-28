import type { GitInvokeResponse, GitConflictAwareResult } from '../git.types'

export async function invokeGitRebaseSkip(rootPath: string): Promise<GitConflictAwareResult> {
  const res = (await window.api.gitRebaseSkip({ rootPath })) as GitInvokeResponse<GitConflictAwareResult>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to skip rebase patch.')
  }
  return res.data
}
