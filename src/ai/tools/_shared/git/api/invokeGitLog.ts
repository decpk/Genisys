import type { GitInvokeResponse, GitLogEntry } from '../git.types'

interface InvokeGitLogParams {
  rootPath: string
  maxCount?: number
  skip?: number
}

/**
 * Fetch a slice of `git log` for the repo. Wraps `cmd_get_git_log`,
 * which already filters merges and returns a structured array.
 */
export async function invokeGitLog(params: InvokeGitLogParams): Promise<GitLogEntry[]> {
  const res = (await window.api.getGitLog({
    rootPath: params.rootPath,
    maxCount: params.maxCount,
    skip: params.skip,
  })) as GitInvokeResponse<GitLogEntry[]>
  if (!res?.success || !Array.isArray(res.data)) {
    throw new Error(res?.error || 'Failed to load git log.')
  }
  return res.data
}
