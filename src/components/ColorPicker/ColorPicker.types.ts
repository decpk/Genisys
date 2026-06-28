export interface ColorPickerProps {
  /** Current hex value, e.g. `#ff8800`. May be invalid; fallback is used. */
  hex: string
  /** Fired on every change — receives an `#rrggbb` hex. */
  onChange: (hex: string) => void
}
