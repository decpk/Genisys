import type { SectionVariant } from '../../shared/constants/sectionVariants.constants'
import type { TaskSectionVariant } from '../TaskSection.types'

const MAP: Record<TaskSectionVariant, SectionVariant> = {
  active: 'tasks',
  completed: 'completed',
}

/**
 * Translates the local `TaskSectionVariant` (the public prop) into the global
 * `SectionVariant` consumed by the shared `SectionShell` / `SectionHeader`
 * primitives. Kept in a tiny pure function so the mapping is centralized and
 * unit-testable.
 */
export function mapToSectionVariant(variant: TaskSectionVariant): SectionVariant {
  return MAP[variant]
}
