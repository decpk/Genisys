import type { LucideIcon } from "lucide-react";

export interface AnalyticsSummaryCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accentClass?: string;
  tintClass?: string;
  iconBadgeClass?: string;
}
