import type { TerminalGitStatusData } from '../TerminalGitPanel.types'

/**
 * Loads `git status` for a folder via the existing git backend command.
 * Returns the resolved repo root + the changed files, or throws when the
 * backend reports a failure.
 */
export async function fetchTerminalGitStatus(
  rootPath: string,
): Promise<TerminalGitStatusData> {
  const result = await window.api.getGitStatus({ rootPath })
  if (result.success && result.data) {
    return { gitRoot: result.data.gitRoot, files: result.data.files }
  }
  throw new Error(result.error ?? 'Failed to get git status.')
}
