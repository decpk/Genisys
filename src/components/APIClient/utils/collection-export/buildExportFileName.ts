import { GENISYS_EXPORT_EXTENSION } from './collection-export.constants'

/**
 * Builds a safe export file name by slugifying the given name and
 * appending the Genisys export extension. Falls back to 'export' when the
 * slug is empty.
 */
export function buildExportFileName(name: string): string {
  let slug = name.trim().toLowerCase()
  slug = slug.replace(/[^a-z0-9]+/g, '-')
  slug = slug.replace(/^-+/, '')
  slug = slug.replace(/-+$/, '')

  if (slug.length === 0) {
    slug = 'export'
  }

  return `${slug}.${GENISYS_EXPORT_EXTENSION}`
}
