import type { GitInvokeResponse, GitConflictAwareResult } from '../git.types'

export async function invokeGitRebase(params: {
  rootPath: string
  upstream?: string
  branch?: string
  onto?: string
  interactive?: boolean
}): Promise<GitConflictAwareResult> {
  const res = (await window.api.gitRebase({
    rootPath: params.rootPath,
    upstream: params.upstream,
    branch: params.branch,
    onto: params.onto,
    interactive: params.interactive,
  })) as GitInvokeResponse<GitConflictAwareResult>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to run git rebase.')
  }
  return res.data
}
