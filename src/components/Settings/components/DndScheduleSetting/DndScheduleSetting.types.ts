/**
 * Props for the top-level `DndScheduleSetting` component.
 *
 * Currently no required props — the component reads all state from
 * the settings store via its hook. `Record<string, never>` keeps the
 * type explicit ("no props") without tripping the `no-empty-object-type`
 * lint rule, while leaving room to extend in the future.
 */
export type DndScheduleSettingProps = Record<string, never>

/** Visual variant for the "Active now" / "Idle" / "Off" status badge. */
export type DndStatusVariant = 'active' | 'inactive'

/** Display payload for the status badge. */
export interface DndStatusInfo {
  label: string
  variant: DndStatusVariant
}
