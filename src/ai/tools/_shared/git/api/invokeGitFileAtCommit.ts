import type { GitInvokeResponse } from '../git.types'

export interface InvokeGitFileAtCommitParams {
  rootPath: string
  /** Repo-relative path to the file (leading slash is tolerated). */
  filePath: string
  /** Commit SHA, ref name, or any rev-parse-resolvable string. */
  commitHash: string
}

/**
 * Reads the contents of a file as it existed at a specific commit.
 * Wraps `cmd_get_local_file_at_commit` (`git show <hash>:<path>`).
 *
 * Returns an empty string when the file did not exist at that commit
 * (matches backend behavior).
 */
export async function invokeGitFileAtCommit(params: InvokeGitFileAtCommitParams): Promise<string> {
  const res = (await window.api.getLocalFileAtCommit({
    rootPath: params.rootPath,
    filePath: params.filePath,
    commitHash: params.commitHash,
  })) as GitInvokeResponse<string>
  if (!res?.success) {
    throw new Error(res?.error || 'Failed to read file at commit.')
  }
  return res.data ?? ''
}
