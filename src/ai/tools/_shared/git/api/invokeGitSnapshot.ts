import type { GitInvokeResponse, GitSnapshotData } from '../git.types'

/**
 * One-shot batched git status: branch + ahead/behind + categorized
 * working/index/untracked/merge entries. Wraps `cmd_git_snapshot`.
 *
 * Throws when the backend returns `success: false` so callers can
 * surface a clean tool error instead of unwrapping envelopes.
 */
export async function invokeGitSnapshot(rootPath: string): Promise<GitSnapshotData> {
  const res = (await window.api.gitSnapshot({ rootPath })) as GitInvokeResponse<GitSnapshotData>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to load git status.')
  }
  return res.data
}
