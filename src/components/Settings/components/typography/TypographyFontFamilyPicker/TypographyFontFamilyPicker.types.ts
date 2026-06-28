export interface TypographyFontFamilyPickerProps {
  /** Currently selected font-family CSS stack, or `null` for "System default". */
  value: string | null
  onChange: (next: string | null) => void
}
