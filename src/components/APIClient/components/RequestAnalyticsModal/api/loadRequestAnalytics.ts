import type { ApiAnalyticsPoint } from "../../../APIClient.types";

export async function loadRequestAnalytics(
  requestId: string,
  sinceISO: string,
): Promise<ApiAnalyticsPoint[]> {
  const rows = await window.api.apiLoadRequestAnalytics(requestId, sinceISO);
  return (rows ?? []) as ApiAnalyticsPoint[];
}
