import type { GitInvokeResponse } from '../git.types'

interface InvokeGitCheckoutBranchParams {
  rootPath: string
  /** Branch name to switch to (or create). */
  branch: string
  /** When true, runs `git checkout -b <branch>` instead of `git checkout`. */
  create: boolean
}

interface GitCheckoutOutput {
  stdout: string
  branch: string
}

/**
 * Switch to (or create) a branch. Wraps `cmd_git_checkout_branch`.
 * Will fail when there are conflicting uncommitted changes — the
 * underlying git error is surfaced verbatim.
 */
export async function invokeGitCheckoutBranch(
  params: InvokeGitCheckoutBranchParams,
): Promise<GitCheckoutOutput> {
  const res = (await window.api.gitCheckoutBranch({
    rootPath: params.rootPath,
    branch: params.branch,
    create: params.create,
  })) as GitInvokeResponse<GitCheckoutOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to checkout branch.')
  }
  return res.data
}
