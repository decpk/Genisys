export interface AgendaSectionLabelProps {
  /** Section name e.g. "Tasks" / "Meetings". Rendered uppercase. */
  label: string
  /**
   * Optional right-aligned count badge (e.g. "0/2" or "3 total"). Pass any
   * pre-formatted string. Hidden when undefined.
   */
  count?: string
  /**
   * Variant ring color for the count chip — keeps each section's identity
   * visually consistent with DayView. Defaults to "amber" (matching the
   * tile's own identity).
   */
  variant?: 'amber' | 'emerald' | 'blue'
}
