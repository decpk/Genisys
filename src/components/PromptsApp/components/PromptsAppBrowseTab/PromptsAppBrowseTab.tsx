import { LayoutGrid } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { PromptsAppBrowseTabProps } from './PromptsAppBrowseTab.types'

/**
 * Permanent first tab in the PromptsApp tab strip. Always visible, no
 * close affordance — selecting it returns the user to the prompt grid.
 */
export function PromptsAppBrowseTab(
  props: PromptsAppBrowseTabProps,
): React.JSX.Element {
  const { isActive, onSelect } = props

  return (
    <button
      onClick={onSelect}
      className={cn(
        'flex h-9 shrink-0 select-none items-center gap-1.5 border-b-2 px-3 text-xs transition-colors',
        isActive
          ? 'border-b-primary bg-background text-foreground'
          : 'border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground',
      )}
    >
      <LayoutGrid className="size-3.5" />
      <span className="text-[11px] font-medium">Browse</span>
    </button>
  )
}
