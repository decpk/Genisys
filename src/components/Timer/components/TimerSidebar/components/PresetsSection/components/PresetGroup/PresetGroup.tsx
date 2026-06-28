import { PresetRowItem } from '../PresetRowItem'

import type { PresetGroupProps } from './PresetGroup.types'

export function PresetGroup(props: PresetGroupProps): React.JSX.Element {
  const { title, icon: Icon, rows, onSelect, onAction, trailing, emptyMessage } = props
  const hasRows = rows.length > 0
  const emptyState =
    !hasRows && emptyMessage ? (
      <div className="px-2 py-2 text-[11px] text-muted-foreground/70 italic">
        {emptyMessage}
      </div>
    ) : null

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-1.5 px-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <Icon size={11} className="text-muted-foreground/70" />
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
        </div>
        {trailing}
      </div>
      <div className="flex flex-col gap-0.5">
        {rows.map((row) => (
          <PresetRowItem
            key={row.preset.id}
            row={row}
            onSelect={onSelect}
            onAction={onAction}
          />
        ))}
        {emptyState}
      </div>
    </div>
  )
}
