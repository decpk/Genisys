import type { GitInvokeResponse } from '../git.types'

interface InvokeGitDiscardChangesParams {
  rootPath: string
  /**
   * Repo-relative paths. Tracked files are restored from the index
   * (`git checkout -- f`); untracked files are removed (`git clean -f -- f`).
   * Destructive — callers should confirm first.
   */
  files: string[]
}

/**
 * Discard working-tree changes for the given paths. Wraps
 * `cmd_git_discard_changes`. Destructive: untracked files are deleted.
 */
export async function invokeGitDiscardChanges(
  params: InvokeGitDiscardChangesParams,
): Promise<void> {
  const res = (await window.api.gitDiscardChanges({
    rootPath: params.rootPath,
    files: params.files,
  })) as GitInvokeResponse<unknown>
  if (!res?.success) {
    throw new Error(res?.error || 'Failed to discard changes.')
  }
}
