import { DUMMY_DATA_CATEGORIES } from '../catalog'
import type { DummyDataCategory } from '../dummyData.types'

/** Finds a dummy-data category by id, or returns undefined when not found. */
export function getCategoryById(id: string): DummyDataCategory | undefined {
  return DUMMY_DATA_CATEGORIES.find((category) => category.id === id)
}
