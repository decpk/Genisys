import {
  BREADCRUMB_SEPARATOR,
  BREADCRUMB_TITLE_SEPARATOR,
  UNTITLED_NOTE_FALLBACK,
} from '../notes-export.constants'

/**
 * Build a chapter title that preserves the note's location inside the
 * exported container.
 *
 * - When `breadcrumbSegments` is empty, returns the note title alone.
 * - Otherwise joins segments with `/` and appends the title after `—`.
 *
 * Examples:
 *   buildBreadcrumbTitle([], 'My Note')                       // "My Note"
 *   buildBreadcrumbTitle(['Section A'], 'My Note')            // "Section A — My Note"
 *   buildBreadcrumbTitle(['Section A', 'Topic B'], 'My Note') // "Section A / Topic B — My Note"
 */
export function buildBreadcrumbTitle(
  breadcrumbSegments: string[],
  noteTitle: string | null | undefined,
): string {
  const safeTitle = (noteTitle && noteTitle.trim().length > 0) ? noteTitle : UNTITLED_NOTE_FALLBACK
  if (breadcrumbSegments.length === 0) return safeTitle
  const prefix = breadcrumbSegments.join(BREADCRUMB_SEPARATOR)
  return `${prefix}${BREADCRUMB_TITLE_SEPARATOR}${safeTitle}`
}
