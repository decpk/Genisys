import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  HardDrive,
  Hash,
} from "lucide-react";

import { formatBytes, formatTime } from "../../../../utils/format-response";
import { AnalyticsSummaryCard } from "../AnalyticsSummaryCard";
import type { AnalyticsSummaryCardProps } from "../AnalyticsSummaryCard/AnalyticsSummaryCard.types";
import type { AnalyticsSummaryCardsProps } from "./AnalyticsSummaryCards.types";

export function AnalyticsSummaryCards(
  props: AnalyticsSummaryCardsProps,
): React.JSX.Element {
  const { summary } = props;
  const successRate = `${(summary.successRate * 100).toFixed(1)}%`;
  const cards: AnalyticsSummaryCardProps[] = [
    {
      label: "Total Calls",
      value: String(summary.totalCalls),
      icon: Hash,
      accentClass: "text-sky-400",
      tintClass:
        "border-sky-500/20 from-sky-500/10 to-sky-500/[0.02] hover:border-sky-500/40",
      iconBadgeClass: "bg-sky-500/10 ring-sky-500/20",
    },
    {
      label: "Success Rate",
      value: successRate,
      icon: CheckCircle2,
      accentClass: "text-emerald-400",
      tintClass:
        "border-emerald-500/20 from-emerald-500/10 to-emerald-500/[0.02] hover:border-emerald-500/40",
      iconBadgeClass: "bg-emerald-500/10 ring-emerald-500/20",
    },
    {
      label: "Avg Latency",
      value: formatTime(summary.avgLatencyMs),
      icon: Gauge,
      accentClass: "text-violet-400",
      tintClass:
        "border-violet-500/20 from-violet-500/10 to-violet-500/[0.02] hover:border-violet-500/40",
      iconBadgeClass: "bg-violet-500/10 ring-violet-500/20",
    },
    {
      label: "p95 Latency",
      value: formatTime(summary.p95LatencyMs),
      icon: Activity,
      accentClass: "text-indigo-400",
      tintClass:
        "border-indigo-500/20 from-indigo-500/10 to-indigo-500/[0.02] hover:border-indigo-500/40",
      iconBadgeClass: "bg-indigo-500/10 ring-indigo-500/20",
    },
    {
      label: "p99 Latency",
      value: formatTime(summary.p99LatencyMs),
      icon: Activity,
      accentClass: "text-amber-400",
      tintClass:
        "border-amber-500/20 from-amber-500/10 to-amber-500/[0.02] hover:border-amber-500/40",
      iconBadgeClass: "bg-amber-500/10 ring-amber-500/20",
    },
    {
      label: "Avg Size",
      value: formatBytes(summary.avgSizeBytes),
      icon: HardDrive,
      accentClass: "text-cyan-400",
      tintClass:
        "border-cyan-500/20 from-cyan-500/10 to-cyan-500/[0.02] hover:border-cyan-500/40",
      iconBadgeClass: "bg-cyan-500/10 ring-cyan-500/20",
    },
    {
      label: "Errors",
      value: String(summary.errorCount),
      icon: AlertTriangle,
      accentClass: "text-red-400",
      tintClass:
        "border-red-500/20 from-red-500/10 to-red-500/[0.02] hover:border-red-500/40",
      iconBadgeClass: "bg-red-500/10 ring-red-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
      {cards.map((card) => (
        <AnalyticsSummaryCard key={card.label} {...card} />
      ))}
    </div>
  );
}
