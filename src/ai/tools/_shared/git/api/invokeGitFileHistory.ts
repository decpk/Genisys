import type { GitFileHistoryEntry, GitInvokeResponse } from '../git.types'

interface InvokeGitFileHistoryParams {
  rootPath: string
  /** File path relative to repo root. */
  filePath: string
}

/**
 * Last 50 commits that touched a single file (with `--follow`). Wraps
 * `cmd_get_local_file_git_history`.
 */
export async function invokeGitFileHistory(
  params: InvokeGitFileHistoryParams,
): Promise<GitFileHistoryEntry[]> {
  const res = (await window.api.getLocalFileGitHistory({
    rootPath: params.rootPath,
    filePath: params.filePath,
  })) as GitInvokeResponse<GitFileHistoryEntry[]>
  if (!res?.success || !Array.isArray(res.data)) {
    throw new Error(res?.error || 'Failed to load file history.')
  }
  return res.data
}
