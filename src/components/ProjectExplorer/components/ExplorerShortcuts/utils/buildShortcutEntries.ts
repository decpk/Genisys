import type { UserDirectories } from "@/tauri-api-bridge";
import type {
  ExplorerShortcutKey,
  ExplorerShortcutVisibility,
} from "@/store/explorer-shortcut-keys";
import { EXPLORER_SHORTCUT_DESCRIPTORS } from "../ExplorerShortcuts.constants";
import type { ExplorerShortcutEntry } from "../ExplorerShortcuts.types";
import { repoInfoFromLocalPath } from "./repoInfoFromLocalPath";
import { shortcutRepoMapKey } from "./shortcutRepoMapKey";

/**
 * Project the raw `UserDirectories` payload + user visibility prefs +
 * pane-active map into the array of entries the view renders. Pure function
 * so it can be unit-tested in isolation.
 *
 * Filter rules:
 *  - skip entries the user has toggled off (visibility[key] === false)
 *  - skip entries the OS did not return a path for (path is null)
 */
export function buildShortcutEntries(
  dirs: UserDirectories | null,
  visibility: ExplorerShortcutVisibility,
  activeRepoMap: Map<string, number[]>,
): ExplorerShortcutEntry[] {
  if (!dirs) return [];
  const result: ExplorerShortcutEntry[] = [];
  for (const descriptor of EXPLORER_SHORTCUT_DESCRIPTORS) {
    const key: ExplorerShortcutKey = descriptor.key;
    if (!visibility[key]) continue;
    const path = dirs[key];
    if (!path) continue;
    const repoMapKey = shortcutRepoMapKey(path);
    const paneNumbers = activeRepoMap.get(repoMapKey);
    result.push({
      key,
      label: descriptor.label,
      icon: descriptor.icon,
      path,
      repoInfo: repoInfoFromLocalPath(path),
      repoMapKey,
      paneNumbers,
      isActive: Boolean(paneNumbers && paneNumbers.length > 0),
    });
  }
  return result;
}
