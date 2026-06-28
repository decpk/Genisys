import type { GitInvokeResponse, GitConflictAwareResult } from '../git.types'

export type GitBisectOp = 'start' | 'good' | 'bad' | 'skip' | 'reset'

export async function invokeGitBisect(params: {
  rootPath: string
  op: GitBisectOp
  args?: string[]
}): Promise<GitConflictAwareResult> {
  const res = (await window.api.gitBisect({
    rootPath: params.rootPath,
    op: params.op,
    args: params.args,
  })) as GitInvokeResponse<GitConflictAwareResult>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to run git bisect.')
  }
  return res.data
}
