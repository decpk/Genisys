/**
 * Returns whether `rootPath` is inside a local git repository. Resolves to
 * `false` (rather than throwing) when the backend reports a failure, so the
 * panel can show a friendly "not a git repository" state.
 */
export async function checkTerminalGitRepo(rootPath: string): Promise<boolean> {
  const result = await window.api.isLocalGitRepo({ rootPath })
  if (result.success) return Boolean(result.data)
  return false
}
