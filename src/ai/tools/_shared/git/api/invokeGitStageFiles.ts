import type { GitInvokeResponse } from '../git.types'

interface InvokeGitStageFilesParams {
  rootPath: string
  /** Repo-relative paths. Empty array = stage all (`git add -A`). */
  files: string[]
}

/**
 * Stage one or more files (or `git add -A` when `files` is empty).
 * Wraps `cmd_git_stage_files`.
 */
export async function invokeGitStageFiles(params: InvokeGitStageFilesParams): Promise<void> {
  const res = (await window.api.gitStageFiles({
    rootPath: params.rootPath,
    files: params.files,
  })) as GitInvokeResponse<unknown>
  if (!res?.success) {
    throw new Error(res?.error || 'Failed to stage files.')
  }
}
