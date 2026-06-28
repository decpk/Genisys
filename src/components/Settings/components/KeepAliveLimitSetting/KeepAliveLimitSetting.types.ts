export interface KeepAliveLimitOption {
  /** Stringified select value ('2'..'5', or 'unlimited' for the 0 sentinel). */
  value: string
  /** Human-readable label shown in the dropdown trigger and list. */
  label: string
}

export interface UseKeepAliveLimitSettingData {
  /** Currently-selected option value (reflects the store; 0 -> 'unlimited'). */
  value: string
  /** Selectable options for the dropdown. */
  options: KeepAliveLimitOption[]
  /** Handles a new select value, mapping 'unlimited' -> 0 before persisting. */
  onChange: (value: string) => void
}
