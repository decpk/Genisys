import type { GitInvokeResponse } from '../git.types'

interface GitResetOutput {
  stdout: string
}

export type GitResetMode = 'soft' | 'mixed' | 'hard'

/** `git reset --<mode> <target>`. Wraps `cmd_git_reset`. */
export async function invokeGitReset(params: {
  rootPath: string
  target: string
  mode: GitResetMode
}): Promise<string> {
  const res = (await window.api.gitReset({
    rootPath: params.rootPath,
    target: params.target,
    mode: params.mode,
  })) as GitInvokeResponse<GitResetOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to reset.')
  }
  return res.data.stdout
}
