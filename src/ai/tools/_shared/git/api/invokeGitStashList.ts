import type { GitInvokeResponse } from '../git.types'

interface GitStashListOutput {
  stdout: string
}

/** List stash entries. Wraps `cmd_git_stash_list`. */
export async function invokeGitStashList(rootPath: string): Promise<string> {
  const res = (await window.api.gitStashList({ rootPath })) as GitInvokeResponse<GitStashListOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to list stashes.')
  }
  return res.data.stdout
}
