import type { GitInvokeResponse } from '../git.types'

interface InvokeGitUnstageFilesParams {
  rootPath: string
  /** Repo-relative paths to remove from the index (no working-tree effect). */
  files: string[]
}

/**
 * Unstage files (`git reset HEAD -- <files>`). Wraps
 * `cmd_git_unstage_files`. The working tree is untouched.
 */
export async function invokeGitUnstageFiles(params: InvokeGitUnstageFilesParams): Promise<void> {
  const res = (await window.api.gitUnstageFiles({
    rootPath: params.rootPath,
    files: params.files,
  })) as GitInvokeResponse<unknown>
  if (!res?.success) {
    throw new Error(res?.error || 'Failed to unstage files.')
  }
}
