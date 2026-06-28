import { AnalyticsSummaryCards } from "../AnalyticsSummaryCards";
import { ExecutionsTable } from "../ExecutionsTable";
import { ResponseTimeChart } from "../ResponseTimeChart";
import { StatusDistributionChart } from "../StatusDistributionChart";
import { ThroughputChart } from "../ThroughputChart";
import { TimingBreakdownChart } from "../TimingBreakdownChart";
import type { RequestAnalyticsContentProps } from "./RequestAnalyticsContent.types";

export function RequestAnalyticsContent(
  props: RequestAnalyticsContentProps,
): React.JSX.Element {
  const { data } = props;

  return (
    <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col gap-5">
      <AnalyticsSummaryCards summary={data.summary} />
      <div className="grid gap-5 lg:grid-cols-2">
        <ResponseTimeChart data={data.responseSeries} />
        <ThroughputChart data={data.throughput} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <StatusDistributionChart data={data.statusDistribution} />
        <TimingBreakdownChart timing={data.timing} />
      </div>
      <ExecutionsTable points={data.points} />
    </div>
  );
}
