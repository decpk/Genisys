import { cn } from '@/lib/utils'

import { PRESET_ICONS } from '../../../../constants/timerPresetIcons'

import type { PresetIconPickerProps } from './PresetIconPicker.types'

/**
 * Grid of icon options. Each option uses the same icon-pill styling as
 * sidebar rows so users see exactly how the picked icon will render.
 */
export function PresetIconPicker(props: PresetIconPickerProps): React.JSX.Element {
  const { value, onChange } = props
  return (
    <div className="grid grid-cols-8 gap-1.5">
      {PRESET_ICONS.map((entry) => {
        const Icon = entry.component
        const active = entry.key === value
        return (
          <button
            key={entry.key}
            type="button"
            aria-label={entry.label}
            title={entry.label}
            onClick={() => onChange(entry.key)}
            className={cn(
              'flex size-8 items-center justify-center rounded-md transition-colors',
              active
                ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                : 'bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground',
            )}
          >
            <Icon size={14} />
          </button>
        )
      })}
    </div>
  )
}
