import type { LucideIcon } from "lucide-react";
import type { ExplorerShortcutKey } from "@/store/explorer-shortcut-keys";
import type { RepoInfo } from "../../ProjectExplorer.types";

export interface ExplorerShortcutDescriptor {
  key: ExplorerShortcutKey;
  label: string;
  icon: LucideIcon;
}

export interface ExplorerShortcutEntry {
  key: ExplorerShortcutKey;
  label: string;
  icon: LucideIcon;
  path: string;
  repoInfo: RepoInfo;
  repoMapKey: string;
  paneNumbers: number[] | undefined;
  isActive: boolean;
}

export interface ExplorerShortcutsProps {
  onSelect: (repo: RepoInfo) => void;
  activeRepoMap: Map<string, number[]>;
  hasMultiplePanes: boolean;
}
