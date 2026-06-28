import type { GitInvokeResponse } from '../git.types'

/**
 * Returns the `origin` remote URL or `null` when no remote is configured.
 * Wraps `cmd_get_git_remote_url` — never throws on missing remote.
 */
export async function invokeGitRemoteUrl(rootPath: string): Promise<string | null> {
  const res = (await window.api.getGitRemoteUrl({ rootPath })) as GitInvokeResponse<string | null>
  if (!res?.success) {
    throw new Error(res?.error || 'Failed to read remote URL.')
  }
  return res.data ?? null
}
