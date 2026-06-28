import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

import { TIMER_THEMES } from '../../../../constants/timerThemes'

import type { ThemePickerProps } from './ThemePicker.types'

export function ThemePicker(props: ThemePickerProps): React.JSX.Element {
  const { value, onChange } = props
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {TIMER_THEMES.map((t) => {
        const active = t.id === value
        const checkmark = active ? <Check size={14} className="absolute inset-0 m-auto text-white" /> : null
        return (
          <button
            key={t.id}
            type="button"
            aria-label={t.label}
            onClick={() => onChange(t.id)}
            className={cn(
              'relative size-7 rounded-full border-2 transition-transform',
              active ? 'scale-110 border-foreground' : 'border-transparent hover:scale-105',
            )}
            style={{ backgroundColor: t.ringColor }}
          >
            {checkmark}
          </button>
        )
      })}
    </div>
  )
}
