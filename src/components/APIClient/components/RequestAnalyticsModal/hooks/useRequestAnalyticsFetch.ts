import { useEffect, useState } from "react";

import type {
  AnalyticsRange,
  ApiAnalyticsPoint,
} from "../../../APIClient.types";
import { loadRequestAnalytics } from "../api/loadRequestAnalytics";
import { DEFAULT_ANALYTICS_RANGE } from "../RequestAnalyticsModal.constants";
import { getRangeDays } from "../utils/getRangeDays";
import { getRangeStartISO } from "../utils/getRangeStartISO";

const EMPTY_POINTS: ApiAnalyticsPoint[] = [];

interface UseRequestAnalyticsFetchResult {
  range: AnalyticsRange;
  setRange: (range: AnalyticsRange) => void;
  loading: boolean;
  points: ApiAnalyticsPoint[];
}

export function useRequestAnalyticsFetch(
  requestId: string | null,
  open: boolean,
): UseRequestAnalyticsFetchResult {
  const [range, setRange] = useState<AnalyticsRange>(DEFAULT_ANALYTICS_RANGE);
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState<ApiAnalyticsPoint[]>(EMPTY_POINTS);

  useEffect(() => {
    if (!open || !requestId) return;
    let cancelled = false;
    const since = getRangeStartISO(getRangeDays(range));
    const run = async () => {
      setLoading(true);
      try {
        const rows = await loadRequestAnalytics(requestId, since);
        if (!cancelled) setPoints(rows);
      } catch {
        if (!cancelled) setPoints(EMPTY_POINTS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [requestId, open, range]);

  return { range, setRange, loading, points };
}
