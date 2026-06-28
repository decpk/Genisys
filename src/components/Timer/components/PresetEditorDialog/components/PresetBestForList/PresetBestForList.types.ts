export interface PresetBestForListProps {
  /** Current list of bullet strings. May contain blank rows. */
  value: string[]
  onChange: (next: string[]) => void
  /** Hard cap on number of bullets. Defaults to 5. */
  maxItems?: number
}
