import type { AnalyticsRange, HttpMethod } from "../../APIClient.types";
import { useRequestAnalyticsAggregates } from "./hooks/useRequestAnalyticsAggregates";
import { useRequestAnalyticsFetch } from "./hooks/useRequestAnalyticsFetch";
import { useRequestMeta } from "./hooks/useRequestMeta";
import type { RequestAnalyticsData } from "./RequestAnalyticsModal.types";

interface UseRequestAnalyticsModalDataProps {
  requestId: string | null;
  open: boolean;
}

interface RequestMeta {
  name: string;
  method: HttpMethod;
  url: string;
}

interface UseRequestAnalyticsModalDataResult {
  range: AnalyticsRange;
  setRange: (range: AnalyticsRange) => void;
  loading: boolean;
  isEmpty: boolean;
  meta: RequestMeta;
  data: RequestAnalyticsData;
}

export function useRequestAnalyticsModalData(
  props: UseRequestAnalyticsModalDataProps,
): UseRequestAnalyticsModalDataResult {
  const { requestId, open } = props;
  const { range, setRange, loading, points } = useRequestAnalyticsFetch(
    requestId,
    open,
  );
  const data = useRequestAnalyticsAggregates(points, range);
  const meta = useRequestMeta(requestId);

  return { range, setRange, loading, isEmpty: points.length === 0, meta, data };
}
