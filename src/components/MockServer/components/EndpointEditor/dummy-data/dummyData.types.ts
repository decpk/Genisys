/**
 * Type definitions for the Mock Server dummy-data catalog.
 * Declaration-only file: no runtime code lives here.
 */

export type DummyDataGroup = 'collections' | 'responses'

/** A single generated payload — shape varies per category. */
export type DummyDataPayload = unknown

/** Produces a dummy payload. `count` is honored only when `supportsCount` is true. */
export type DummyDataGenerator = (count: number) => DummyDataPayload

/** A selectable entry in the "Add dummy data" modal. */
export interface DummyDataCategory {
  /** Stable unique id (kebab-case). */
  id: string
  /** Human-readable label shown in the list. */
  name: string
  /** Short one-line description shown under the label. */
  description: string
  /** Logical grouping used to section the list. */
  group: DummyDataGroup
  /** When true, the modal shows a count control and passes it to `generate`. */
  supportsCount: boolean
  /** Builds the JSON payload for this category. */
  generate: DummyDataGenerator
}
