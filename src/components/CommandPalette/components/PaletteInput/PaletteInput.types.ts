import type { ChangeEvent, KeyboardEvent } from 'react'

export interface PaletteInputProps {
  query: string
  modeLabel: string | null
  onChange: (value: string) => void
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void
}

export type PaletteInputChangeEvent = ChangeEvent<HTMLInputElement>
