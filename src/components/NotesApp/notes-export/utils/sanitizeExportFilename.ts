/**
 * Convert a human-readable title into a safe filename stem.
 *
 * - Strips characters that are not alphanumeric / space / underscore / hyphen.
 * - Collapses runs of whitespace into a single underscore.
 * - Trims leading/trailing whitespace.
 *
 * Mirrors the behaviour used by the Library exporters so notes and
 * books produce visually-consistent filenames.
 */
export function sanitizeExportFilename(title: string): string {
  return title
    .replace(/[^a-zA-Z0-9 _-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
}
