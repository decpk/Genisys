import type { GitInvokeResponse } from '../git.types'

export interface InvokeGitStashSaveParams {
  rootPath: string
  message?: string
  includeUntracked?: boolean
  keepIndex?: boolean
}

interface GitStashSaveOutput {
  stdout: string
}

/** Save current changes to the stash. Wraps `cmd_git_stash_save`. */
export async function invokeGitStashSave(params: InvokeGitStashSaveParams): Promise<string> {
  const res = (await window.api.gitStashSave({
    rootPath: params.rootPath,
    message: params.message,
    includeUntracked: params.includeUntracked,
    keepIndex: params.keepIndex,
  })) as GitInvokeResponse<GitStashSaveOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to save stash.')
  }
  return res.data.stdout
}
