import type { UsageStats } from '@/lib/usage'

export interface UsageBodyProps {
  isLoading: boolean
  error: string | null
  showEmpty: boolean
  stats: UsageStats | null
}
