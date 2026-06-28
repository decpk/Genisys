import type { GitInvokeResponse } from '../git.types'

interface GitFetchOutput {
  stdout: string
}

/**
 * `git fetch --all --prune` — refresh remote refs without modifying
 * the working tree. Wraps `cmd_git_fetch`.
 */
export async function invokeGitFetch(rootPath: string): Promise<GitFetchOutput> {
  const res = (await window.api.gitFetch({ rootPath })) as GitInvokeResponse<GitFetchOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to fetch.')
  }
  return res.data
}
