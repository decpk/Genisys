import { Calendar } from 'lucide-react'
import type { CommitDateGroupProps } from './CommitDateGroup.types'

export function CommitDateGroup({ label, children }: CommitDateGroupProps): React.JSX.Element {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background sticky top-[28px] z-20 border-b border-border/30">
        <Calendar size={10} className="text-muted-foreground/60 shrink-0" />
        <span className="text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  )
}
