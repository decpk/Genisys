import type { GitInvokeResponse } from '../git.types'

interface GitRevertOutput {
  stdout: string
}

/** `git revert [--no-commit] <commit>`. Wraps `cmd_git_revert`. */
export async function invokeGitRevert(params: {
  rootPath: string
  commit: string
  noCommit?: boolean
}): Promise<string> {
  const res = (await window.api.gitRevert({
    rootPath: params.rootPath,
    commit: params.commit,
    noCommit: params.noCommit,
  })) as GitInvokeResponse<GitRevertOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to revert.')
  }
  return res.data.stdout
}
