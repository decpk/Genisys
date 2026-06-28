import type { GitInvokeResponse, GitConflictAwareResult } from '../git.types'

/** `git merge <ref> [...]`. Returns `{status, stdout, stderr}` (conflict-aware). */
export async function invokeGitMerge(params: {
  rootPath: string
  refName: string
  noFf?: boolean
  squash?: boolean
  message?: string
}): Promise<GitConflictAwareResult> {
  const res = (await window.api.gitMerge({
    rootPath: params.rootPath,
    refName: params.refName,
    noFf: params.noFf,
    squash: params.squash,
    message: params.message,
  })) as GitInvokeResponse<GitConflictAwareResult>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to run git merge.')
  }
  return res.data
}
