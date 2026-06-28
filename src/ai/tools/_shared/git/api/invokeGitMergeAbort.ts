import type { GitInvokeResponse, GitConflictAwareResult } from '../git.types'

export async function invokeGitMergeAbort(rootPath: string): Promise<GitConflictAwareResult> {
  const res = (await window.api.gitMergeAbort({ rootPath })) as GitInvokeResponse<GitConflictAwareResult>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to abort merge.')
  }
  return res.data
}
