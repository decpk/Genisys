import { Switch } from '@/components/ui/switch'

import type { BehaviorRowProps } from './BehaviorRow.types'

export function BehaviorRow(props: BehaviorRowProps): React.JSX.Element {
  const { config, value, onChange } = props
  const Icon = config.icon

  return (
    <div className="flex items-start justify-between gap-3 rounded-md px-2 py-2 hover:bg-accent/20 transition-colors">
      <div className="flex items-start gap-2.5 min-w-0">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-accent/40 text-foreground/75 mt-0.5">
          <Icon size={12} />
        </span>
        <div className="flex flex-col min-w-0">
          <span className="text-[12px] font-medium text-foreground/90 leading-tight">
            {config.label}
          </span>
          <span className="text-[10.5px] text-muted-foreground leading-snug mt-0.5">
            {config.description}
          </span>
        </div>
      </div>
      <Switch
        checked={value}
        onCheckedChange={onChange}
        aria-label={config.label}
        className="mt-1"
      />
    </div>
  )
}
