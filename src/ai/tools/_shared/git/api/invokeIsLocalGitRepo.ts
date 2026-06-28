import type { GitInvokeResponse } from '../git.types'

/**
 * Returns true if `rootPath` resolves to a git working tree. Backed by
 * `git rev-parse --is-inside-work-tree` via the Tauri command
 * `cmd_is_local_git_repo`. Never throws — falsy on any error.
 */
export async function invokeIsLocalGitRepo(rootPath: string): Promise<boolean> {
  const res = (await window.api.isLocalGitRepo({ rootPath })) as GitInvokeResponse<boolean>
  return res?.success === true && res.data === true
}
