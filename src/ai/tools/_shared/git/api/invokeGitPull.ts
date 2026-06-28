import type { GitInvokeResponse } from '../git.types'

interface GitPullOutput {
  stdout: string
}

/**
 * `git pull --ff-only` — fast-forward the current branch from its
 * upstream. Fails (with the git error surfaced) when a merge or rebase
 * would be required. Wraps `cmd_git_pull`.
 */
export async function invokeGitPull(rootPath: string): Promise<GitPullOutput> {
  const res = (await window.api.gitPull({ rootPath })) as GitInvokeResponse<GitPullOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to pull.')
  }
  return res.data
}
