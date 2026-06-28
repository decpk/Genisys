import { memo } from 'react'
import { BarChart3 } from 'lucide-react'

import { AppInlineLoader } from '@/components/AppLoader'
import { EmptyState } from '@/components/ui/empty-state'

import { UsageAnalytics } from '../UsageAnalytics'
import type { UsageBodyProps } from './UsageBody.types'

export const UsageBody = memo(function UsageBody(
  props: UsageBodyProps,
): React.JSX.Element {
  const { isLoading, error, showEmpty, stats } = props

  if (isLoading) {
    return <AppInlineLoader message="Loading usage…" className="py-20" />
  }
  if (error) {
    return <EmptyState message={error} icon={BarChart3} className="py-20" />
  }
  if (showEmpty || !stats) {
    return (
      <EmptyState
        message="No usage recorded for this range yet. Keep using Genisys and check back."
        icon={BarChart3}
        className="py-20"
      />
    )
  }
  return <UsageAnalytics stats={stats} />
})
