import type { GitInvokeResponse } from '../git.types'

interface InvokeGitCommitParams {
  rootPath: string
  /** Full commit message (subject + optional body, separated by blank line). */
  message: string
}

interface GitCommitOutput {
  stdout: string
}

/**
 * Create a commit from currently staged changes. Wraps `cmd_git_commit`,
 * which pipes the message via stdin so multi-line messages are safe.
 */
export async function invokeGitCommit(params: InvokeGitCommitParams): Promise<GitCommitOutput> {
  const res = (await window.api.gitCommit({
    rootPath: params.rootPath,
    message: params.message,
  })) as GitInvokeResponse<GitCommitOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to commit.')
  }
  return res.data
}
