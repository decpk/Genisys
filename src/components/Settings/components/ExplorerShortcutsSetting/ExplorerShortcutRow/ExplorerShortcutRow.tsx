import { memo, useCallback } from "react";
import { Switch } from "@/components/ui/switch";
import type { ExplorerShortcutRowProps } from "./ExplorerShortcutRow.types";

export const ExplorerShortcutRow = memo(function ExplorerShortcutRow(
  props: ExplorerShortcutRowProps,
): React.JSX.Element {
  const { meta, visible, onToggle } = props;
  const Icon = meta.icon;

  const handleChange = useCallback(
    (next: boolean) => onToggle(meta.key, next),
    [meta.key, onToggle],
  );

  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <div className="flex items-start gap-2.5 min-w-0">
        <Icon className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground select-none">
            {meta.label}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed select-none">
            {meta.description}
          </p>
        </div>
      </div>
      <div className="shrink-0">
        <Switch checked={visible} onCheckedChange={handleChange} />
      </div>
    </div>
  );
});
