import type { ChangeEvent } from 'react'

import {
  DUMMY_DATA_MIN_COUNT,
  DUMMY_DATA_MAX_COUNT,
} from '../../DummyDataDialog.constants'
import type { DummyDataCountControlProps } from './DummyDataCountControl.types'

export function DummyDataCountControl(props: DummyDataCountControlProps) {
  const { value, onChange } = props

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value))
  }

  return (
    <label className="flex items-center gap-2">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Items
      </span>
      <input
        type="number"
        min={DUMMY_DATA_MIN_COUNT}
        max={DUMMY_DATA_MAX_COUNT}
        value={value}
        onChange={handleInput}
        className="h-8 w-20 rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="text-[11px] text-muted-foreground">
        ({DUMMY_DATA_MIN_COUNT}–{DUMMY_DATA_MAX_COUNT})
      </span>
    </label>
  )
}
