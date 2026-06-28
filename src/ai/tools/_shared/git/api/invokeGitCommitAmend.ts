import type { GitInvokeResponse } from '../git.types'

interface GitCommitAmendOutput {
  stdout: string
}

/** Amend HEAD. Wraps `cmd_git_commit_amend`. Pipes message via stdin when provided. */
export async function invokeGitCommitAmend(params: {
  rootPath: string
  message?: string
  noEdit?: boolean
}): Promise<string> {
  const res = (await window.api.gitCommitAmend({
    rootPath: params.rootPath,
    message: params.message,
    noEdit: params.noEdit,
  })) as GitInvokeResponse<GitCommitAmendOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to amend commit.')
  }
  return res.data.stdout
}
