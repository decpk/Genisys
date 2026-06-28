import type { DPTask } from '@/components/DailyPlan/DailyPlan.types'

export async function searchTasks(query: string): Promise<DPTask[]> {
  const results = await window.api.dpSearchTasks(query)
  return results || []
}
