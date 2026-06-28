import { useEffect, useMemo, useState } from "react";
import type { UserDirectories } from "@/tauri-api-bridge";
import { useSettingsStore } from "@/store/settings-store";
import { fetchUserDirectories } from "./api/fetchUserDirectories";
import { buildShortcutEntries } from "./utils/buildShortcutEntries";
import type { ExplorerShortcutEntry } from "./ExplorerShortcuts.types";

interface UseExplorerShortcutsDataParams {
  activeRepoMap: Map<string, number[]>;
}

interface UseExplorerShortcutsDataResult {
  entries: ExplorerShortcutEntry[];
  isLoaded: boolean;
}

/**
 * Loads the OS standard directories once on mount and projects them through
 * the user's visibility prefs + currently active panes into ready-to-render
 * shortcut entries.
 */
export function useExplorerShortcutsData(
  params: UseExplorerShortcutsDataParams,
): UseExplorerShortcutsDataResult {
  const { activeRepoMap } = params;
  const visibility = useSettingsStore((s) => s.explorerShortcutVisibility);
  const [dirs, setDirs] = useState<UserDirectories | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchUserDirectories()
      .then((result) => {
        if (cancelled) return;
        setDirs(result);
        setIsLoaded(true);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[ExplorerShortcuts] fetchUserDirectories failed:', err);
        setDirs(null);
        setIsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const entries = useMemo(
    () => buildShortcutEntries(dirs, visibility, activeRepoMap),
    [dirs, visibility, activeRepoMap],
  );

  return { entries, isLoaded };
}
