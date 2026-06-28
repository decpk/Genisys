import { cn } from "@/lib/utils";

import {
  getStatusColor,
  METHOD_BG_COLORS,
} from "../../../../APIClient.constants";
import type { HttpMethod } from "../../../../APIClient.types";
import { formatBytes, formatTime } from "../../../../utils/format-response";
import type { ExecutionRowProps } from "./ExecutionRow.types";

export function ExecutionRow(props: ExecutionRowProps): React.JSX.Element {
  const { point } = props;
  const method = point.method as HttpMethod;
  const methodClass = cn(
    "rounded-md border px-1.5 py-0.5 text-[10px] font-bold",
    METHOD_BG_COLORS[method] ?? "",
  );
  const statusClass = cn(
    "inline-flex items-center gap-1.5 font-semibold tabular-nums",
    getStatusColor(point.statusCode),
  );
  const executedAt = new Date(point.executedAt).toLocaleString();

  return (
    <tr className="border-b border-border/15 transition-colors last:border-0 hover:bg-muted/30">
      <td className="whitespace-nowrap py-2 pr-3 text-muted-foreground">
        {executedAt}
      </td>
      <td className="py-2 pr-3">
        <span className={methodClass}>{method}</span>
      </td>
      <td className="py-2 pr-3">
        <span className={statusClass}>
          <span className="size-1.5 rounded-full bg-current" />
          {point.statusCode}
        </span>
      </td>
      <td className="py-2 pr-3 tabular-nums">{formatTime(point.durationMs)}</td>
      <td className="py-2 tabular-nums text-muted-foreground">
        {formatBytes(point.sizeBytes)}
      </td>
    </tr>
  );
}
