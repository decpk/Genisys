import { memo, useCallback } from 'react'
import { Play } from 'lucide-react'

import { COMPLETION_CHIME_SOUNDS, previewCompletionChime } from '@/lib/audio-completion'
import { SettingRow } from '@/components/Settings/components/SettingRow'

import type { ChimeSoundRowProps } from './ChimeSoundRow.types'

export const ChimeSoundRow = memo(function ChimeSoundRow(props: ChimeSoundRowProps): React.JSX.Element {
  const { label, description, value, onChange, disabled } = props

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(event.target.value)
    },
    [onChange],
  )

  const handlePreview = useCallback(() => {
    previewCompletionChime(value)
  }, [value])

  const selectCls =
    'h-8 px-2 text-xs rounded-md border border-border bg-background text-foreground ' +
    'disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-primary'

  const buttonCls =
    'flex items-center gap-1 h-8 px-2.5 text-xs rounded-md border border-border ' +
    'text-muted-foreground hover:text-foreground hover:bg-secondary ' +
    'disabled:opacity-40 disabled:cursor-not-allowed'

  const isPreviewDisabled = disabled || !value || value === 'none'

  return (
    <SettingRow label={label} description={description}>
      <div className="flex items-center gap-2">
        <select
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={selectCls}
        >
          {COMPLETION_CHIME_SOUNDS.map((sound) => (
            <option key={sound.id} value={sound.id}>
              {sound.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handlePreview}
          disabled={isPreviewDisabled}
          className={buttonCls}
          aria-label="Preview sound"
        >
          <Play size={12} />
          <span>Test</span>
        </button>
      </div>
    </SettingRow>
  )
})
