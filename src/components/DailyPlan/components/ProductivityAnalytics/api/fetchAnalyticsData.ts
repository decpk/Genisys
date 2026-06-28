function getDate(item: Record<string, unknown>): string {
  return (item.scheduledDate || item.scheduled_date || '') as string
}

function groupByDate(items: Record<string, unknown>[]): Record<string, Record<string, unknown>[]> {
  const result: Record<string, Record<string, unknown>[]> = {}
  for (const item of items) {
    const d = getDate(item)
    if (!d) continue
    if (!result[d]) result[d] = []
    result[d].push(item)
  }
  return result
}

export interface AnalyticsRawData {
  tasks: Record<string, Record<string, unknown>[]>
  meetings: Record<string, Record<string, unknown>[]>
}

export async function fetchAnalyticsData(
  startDate: string,
  endDate: string,
): Promise<AnalyticsRawData> {
  const api = (window as any).api
  const [rawTasks, rawMeetings] = await Promise.all([
    api.dpLoadTasks(startDate, endDate).catch(() => []),
    api.dpLoadMeetings(startDate, endDate).catch(() => []),
  ])

  return {
    tasks: groupByDate(rawTasks || []),
    meetings: groupByDate(rawMeetings || []),
  }
}
