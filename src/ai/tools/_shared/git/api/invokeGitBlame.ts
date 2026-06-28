import type { GitBlameData, GitInvokeResponse } from '../git.types'

interface InvokeGitBlameParams {
  rootPath: string
  /** File path relative to repo root. */
  filePath: string
  /** 1-based inclusive start line. */
  startLine: number
  /** 1-based inclusive end line. */
  endLine: number
}

/**
 * Per-line blame metadata for a contiguous range, with deduplicated
 * commit map. Wraps `cmd_git_blame`.
 */
export async function invokeGitBlame(params: InvokeGitBlameParams): Promise<GitBlameData> {
  const res = (await window.api.getGitBlame({
    rootPath: params.rootPath,
    filePath: params.filePath,
    startLine: params.startLine,
    endLine: params.endLine,
  })) as GitInvokeResponse<GitBlameData>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to load blame.')
  }
  return res.data
}
