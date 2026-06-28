import type {
  NormalizedImportVariable,
} from '../collection-import.types'
import type { InsomniaEnvironment, InsomniaResource } from './insomnia.types'

/**
 * Merge the `data` objects of every environment resource into a flat
 * list of normalized collection variables. Values are coerced to
 * strings; later environments override earlier ones on key collision.
 */
export function mapInsomniaVariables(
  resources: InsomniaResource[]
): NormalizedImportVariable[] {
  const merged = new Map<string, string>()

  for (const resource of resources) {
    if (resource._type !== 'environment') continue
    const data = (resource as InsomniaEnvironment).data ?? {}
    for (const [key, value] of Object.entries(data)) {
      merged.set(key, coerceToString(value))
    }
  }

  return Array.from(merged, ([key, value]) => ({ key, value }))
}

function coerceToString(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value)
}
