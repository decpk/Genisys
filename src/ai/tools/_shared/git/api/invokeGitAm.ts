import type { GitConflictAwareResult, GitInvokeResponse } from '../git.types'

export async function invokeGitAm(params: {
  rootPath: string
  patchText: string
  threeWay?: boolean
}): Promise<GitConflictAwareResult> {
  const res = (await window.api.gitAm({
    rootPath: params.rootPath,
    patchText: params.patchText,
    threeWay: params.threeWay,
  })) as GitInvokeResponse<GitConflictAwareResult>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to apply mailbox patch.')
  }
  return res.data
}
