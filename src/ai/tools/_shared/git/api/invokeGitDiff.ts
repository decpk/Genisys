import type { GitDiffData, GitDiffSide, GitInvokeResponse } from '../git.types'

interface InvokeGitDiffParams {
  rootPath: string
  /** File path relative to repo root. */
  file: string
  /**
   * - `working` → unstaged changes (index vs working tree)
   * - `staged`  → staged changes (HEAD vs index)
   * - `head`    → all local changes (HEAD vs working tree)
   */
  side: GitDiffSide
}

/**
 * Returns `original` + `modified` text plus a detected `language` token
 * for a single file. Wraps `cmd_git_get_diff`.
 */
export async function invokeGitDiff(params: InvokeGitDiffParams): Promise<GitDiffData> {
  const res = (await window.api.gitGetDiff({
    rootPath: params.rootPath,
    file: params.file,
    side: params.side,
  })) as GitInvokeResponse<GitDiffData>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to load diff.')
  }
  return res.data
}
