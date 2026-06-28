import type { ExportSubject } from '../notes-export.types'

const SUBJECT_LABELS: Record<string, string> = {
  project: 'Project',
  notebook: 'Notebook',
  section: 'Section',
  topic: 'Topic',
  unsorted: 'Unsorted notes',
}

/**
 * Build the optional sub-title shown beneath the book title on the
 * exported document's cover page.
 *
 * - For a single note: omitted (no description needed).
 * - For a container: returns a human-readable label naming the kind
 *   of container being exported (e.g. `Project · 3 chapters`).
 *
 * Returns `undefined` when there is nothing meaningful to display.
 */
export function resolveSubjectDescription(
  subject: ExportSubject,
  chapterCount: number,
): string | undefined {
  if (subject.kind === 'note') return undefined

  const kindLabel = SUBJECT_LABELS[subject.node.type] ?? 'Container'
  const noun = chapterCount === 1 ? 'note' : 'notes'
  return `${kindLabel} · ${chapterCount} ${noun}`
}
