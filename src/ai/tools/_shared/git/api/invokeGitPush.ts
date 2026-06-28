import type { GitInvokeResponse } from '../git.types'

interface InvokeGitPushParams {
  rootPath: string
  /**
   * When true, runs `git push --set-upstream origin <currentBranch>` to
   * publish a new branch. When false, runs a plain `git push`.
   */
  setUpstream: boolean
}

interface GitPushOutput {
  stdout: string
  /** Present only when `setUpstream` was true. */
  branch?: string
}

/**
 * Push the current branch. Wraps `cmd_git_push`. Detached HEAD with
 * `setUpstream: true` errors out — there is no branch to publish.
 */
export async function invokeGitPush(params: InvokeGitPushParams): Promise<GitPushOutput> {
  const res = (await window.api.gitPush({
    rootPath: params.rootPath,
    setUpstream: params.setUpstream,
  })) as GitInvokeResponse<GitPushOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to push.')
  }
  return res.data
}
