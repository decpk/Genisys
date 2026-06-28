import { memo, useCallback } from "react";

import { cn } from "@/lib/utils";

import type { ExplorerShortcutItemProps } from "./ExplorerShortcutItem.types";

export const ExplorerShortcutItem = memo(function ExplorerShortcutItem(
  props: ExplorerShortcutItemProps,
): React.JSX.Element {
  const { entry, hasMultiplePanes, onSelect } = props;
  const Icon = entry.icon;

  const handleClick = useCallback(() => {
    onSelect(entry.repoInfo);
  }, [entry.repoInfo, onSelect]);

  const isActive = entry.isActive;
  const rowClass = cn(
    "group flex items-center gap-2 w-full h-7 px-2 rounded-md text-left transition-colors cursor-pointer",
    isActive
      ? "bg-accent text-foreground font-medium"
      : "text-foreground hover:bg-muted/40",
  );
  const iconClass = cn("shrink-0 text-muted-foreground");

  let paneBadges: React.ReactNode = null;
  if (isActive && hasMultiplePanes && entry.paneNumbers) {
    paneBadges = entry.paneNumbers.map((num) => (
      <span
        key={num}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/15 text-primary text-[9px] font-bold shrink-0"
      >
        {num}
      </span>
    ));
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={entry.path}
      className={rowClass}
    >
      <Icon size={14} className={iconClass} />
      <span className="text-[12px] font-medium truncate flex-1 text-current">
        {entry.label}
      </span>
      {paneBadges}
    </button>
  );
});
