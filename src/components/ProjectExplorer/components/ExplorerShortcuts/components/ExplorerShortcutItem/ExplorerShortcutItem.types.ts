import type { ExplorerShortcutEntry } from "../../ExplorerShortcuts.types";
import type { RepoInfo } from "../../../../ProjectExplorer.types";

export interface ExplorerShortcutItemProps {
  entry: ExplorerShortcutEntry;
  hasMultiplePanes: boolean;
  onSelect: (repo: RepoInfo) => void;
}
