import { memo } from "react";
import { ExplorerShortcutItem } from "./components/ExplorerShortcutItem";
import { useExplorerShortcutsData } from "./useExplorerShortcutsData";
import type { ExplorerShortcutsProps } from "./ExplorerShortcuts.types";

export const ExplorerShortcuts = memo(function ExplorerShortcuts(
  props: ExplorerShortcutsProps,
): React.JSX.Element | null {
  const { onSelect, activeRepoMap, hasMultiplePanes } = props;
  const { entries, isLoaded } = useExplorerShortcutsData({ activeRepoMap });

  if (!isLoaded) return null;
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-col gap-0.5">
      {entries.map((entry) => (
        <ExplorerShortcutItem
          key={entry.key}
          entry={entry}
          hasMultiplePanes={hasMultiplePanes}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
});
