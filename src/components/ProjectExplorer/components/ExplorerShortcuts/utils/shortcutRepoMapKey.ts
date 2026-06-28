/**
 * Stable map key used for matching a shortcut path against the
 * `activeRepoMap` produced by `useRepoHistory`. Mirrors the local-branch of
 * `repoKey()` so a clicked shortcut shows as "active" when the same path is
 * already open in a pane.
 */
export function shortcutRepoMapKey(absolutePath: string): string {
  return `local:${absolutePath.replace(/\/+$/, "")}`;
}
