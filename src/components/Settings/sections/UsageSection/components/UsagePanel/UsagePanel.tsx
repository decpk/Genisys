import { memo } from 'react'

import { cn } from '@/lib/utils'

import type { UsagePanelProps } from './UsagePanel.types'

export const UsagePanel = memo(function UsagePanel(
  props: UsagePanelProps,
): React.JSX.Element {
  const { title, className, children } = props

  return (
    <section className={cn('rounded-xl border border-border/60 bg-card p-4', className)}>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  )
})
