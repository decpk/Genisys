import type { StatusDistributionLegendItemProps } from "./StatusDistributionLegendItem.types";

export function StatusDistributionLegendItem(
  props: StatusDistributionLegendItemProps,
): React.JSX.Element {
  const { slice, total } = props;
  const pct = `${((slice.count / total) * 100).toFixed(0)}%`;

  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2">
        <span
          className="size-2.5 rounded-sm"
          style={{ backgroundColor: slice.colorVar }}
        />
        <span className="font-medium text-foreground">{slice.codeGroup}</span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="tabular-nums">{slice.count}</span>
        <span className="tabular-nums">{pct}</span>
      </div>
    </div>
  );
}
