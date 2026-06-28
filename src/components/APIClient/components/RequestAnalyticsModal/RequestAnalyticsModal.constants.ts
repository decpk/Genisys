import type { AnalyticsRangeOption } from "./RequestAnalyticsModal.types";

export const ANALYTICS_RANGES: AnalyticsRangeOption[] = [
  { key: "1d", label: "1D", days: 1 },
  { key: "3d", label: "3D", days: 3 },
  { key: "5d", label: "5D", days: 5 },
  { key: "7d", label: "7D", days: 7 },
  { key: "30d", label: "30D", days: 30 },
];

export const DEFAULT_ANALYTICS_RANGE = "7d" as const;

export const ANALYTICS_PANEL_CLASS =
  "rounded-xl border border-border/50 bg-card/40 p-4 shadow-sm transition-colors hover:border-border/70";

export const ANALYTICS_TITLE_CLASS =
  "mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground";
