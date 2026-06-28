import { BarChart3 } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";

import type { AnalyticsEmptyStateProps } from "./AnalyticsEmptyState.types";

export function AnalyticsEmptyState(
  props: AnalyticsEmptyStateProps,
): React.JSX.Element {
  const { requestName } = props;
  const message = `No analytics yet for "${requestName}". Send this request to start collecting data.`;

  return (
    <div className="flex h-full items-center justify-center">
      <EmptyState icon={BarChart3} message={message} />
    </div>
  );
}
