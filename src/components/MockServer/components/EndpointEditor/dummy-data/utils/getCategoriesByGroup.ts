import { DUMMY_DATA_CATEGORIES } from '../catalog'
import type { DummyDataCategory, DummyDataGroup } from '../dummyData.types'

/** Returns the categories belonging to a single group, preserving catalog order. */
export function getCategoriesByGroup(group: DummyDataGroup): DummyDataCategory[] {
  return DUMMY_DATA_CATEGORIES.filter((category) => category.group === group)
}
