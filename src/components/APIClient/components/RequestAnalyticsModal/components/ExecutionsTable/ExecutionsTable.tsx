import { cn } from "@/lib/utils";

import { ExecutionRow } from "../ExecutionRow";
import { MAX_EXECUTION_ROWS } from "./ExecutionsTable.constants";
import type { ExecutionsTableProps } from "./ExecutionsTable.types";
import {
  ANALYTICS_PANEL_CLASS,
  ANALYTICS_TITLE_CLASS,
} from "../../RequestAnalyticsModal.constants";

export function ExecutionsTable(
  props: ExecutionsTableProps,
): React.JSX.Element {
  const { points } = props;
  const recent = [...points]
    .sort((a, b) => Date.parse(b.executedAt) - Date.parse(a.executedAt))
    .slice(0, MAX_EXECUTION_ROWS);

  return (
    <section className={cn(ANALYTICS_PANEL_CLASS, "flex min-h-72 flex-1 flex-col")}>
      <h3 className={ANALYTICS_TITLE_CLASS}>Recent Executions</h3>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm">
            <tr className="border-b border-border/40 text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3 font-semibold">Time</th>
              <th className="py-2 pr-3 font-semibold">Method</th>
              <th className="py-2 pr-3 font-semibold">Status</th>
              <th className="py-2 pr-3 font-semibold">Duration</th>
              <th className="py-2 font-semibold">Size</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((point) => (
              <ExecutionRow key={point.id} point={point} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
