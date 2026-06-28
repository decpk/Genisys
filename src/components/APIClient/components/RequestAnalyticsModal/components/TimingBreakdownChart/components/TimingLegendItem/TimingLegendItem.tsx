import type { TimingLegendItemProps } from "./TimingLegendItem.types";

export function TimingLegendItem(
  props: TimingLegendItemProps,
): React.JSX.Element {
  const { color, label, value } = props;

  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className="size-2.5 shrink-0 rounded-sm"
        style={{ backgroundColor: color }}
      />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto font-medium text-foreground tabular-nums">
        {value}
      </span>
    </div>
  );
}
