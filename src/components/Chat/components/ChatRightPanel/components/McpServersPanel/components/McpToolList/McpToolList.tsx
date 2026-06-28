import { AppInlineLoader } from '@/components/AppLoader'

import { McpToolRow } from '../McpToolRow'
import type { McpToolListProps } from './McpToolList.types'

export function McpToolList(props: McpToolListProps): React.JSX.Element {
  const { tools, loading } = props

  if (loading) {
    return (
      <div className="py-3 px-3">
        <AppInlineLoader message="Loading tools..." size={12} className="text-[11px]" />
      </div>
    )
  }

  if (tools.length === 0) {
    return (
      <p className="text-[11px] text-muted-foreground py-3 px-3">No tools available</p>
    )
  }

  return (
    <div className="mb-1.5 rounded-lg overflow-hidden border border-border/20 mx-1">
      <div className="px-3 py-1.5 text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider bg-muted/30">
        {tools.length} {tools.length === 1 ? 'tool' : 'tools'}
      </div>
      <div className="max-h-[220px] overflow-y-auto">
        {tools.map((tool, i) => (
          <McpToolRow key={tool.name} tool={tool} isAlternate={i % 2 === 1} />
        ))}
      </div>
    </div>
  )
}
