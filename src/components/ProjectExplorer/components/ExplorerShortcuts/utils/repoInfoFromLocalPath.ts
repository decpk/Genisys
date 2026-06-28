import type { RepoInfo } from "../../../ProjectExplorer.types";

/**
 * Build a `RepoInfo` for a local filesystem path. Mirrors the shape produced
 * by `toRepoInfo` in `RepoHistory.hooks.ts` for `source === 'local'` entries
 * so shortcut clicks open the same code path that recent local repos use.
 */
export function repoInfoFromLocalPath(absolutePath: string): RepoInfo {
  const trimmed = absolutePath.replace(/\/+$/, "");
  const name = trimmed.split("/").filter(Boolean).pop() ?? trimmed;
  return {
    organization: "",
    project: "",
    repository: name,
    source: "local",
    localPath: trimmed,
  };
}
