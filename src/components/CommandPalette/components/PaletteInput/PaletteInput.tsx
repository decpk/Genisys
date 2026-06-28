import { Search } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { PaletteInputChangeEvent, PaletteInputProps } from './PaletteInput.types'
import { usePaletteInputData } from './usePaletteInputData'

export function PaletteInput(props: PaletteInputProps) {
  const { query, modeLabel, onChange, onKeyDown } = props
  const { inputRef } = usePaletteInputData()

  const handleChange = (e: PaletteInputChangeEvent): void => {
    onChange(e.currentTarget.value)
  }

  let modePill: React.ReactNode = null
  if (modeLabel) {
    modePill = (
      <span className="rounded border border-primary/30 bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
        {modeLabel}
      </span>
    )
  }

  const placeholder = modeLabel === 'Commands'
    ? 'Run a command…'
    : 'Search anything · type > for commands · @kind to filter'

  return (
    <div className={cn('flex items-center gap-2 border-b border-border px-3 py-2.5')}>
      <Search size={16} className="shrink-0 text-muted-foreground" />
      {modePill}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        className={cn(
          'min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground',
        )}
      />
    </div>
  )
}
