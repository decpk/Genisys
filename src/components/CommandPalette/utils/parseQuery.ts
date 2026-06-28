import { KIND_ALIASES } from '../CommandPalette.constants'
import type { ParsedPaletteQuery, PaletteMode } from '../CommandPalette.types'

/**
 * Parse a raw input string into mode + kind filter + cleaned query.
 *
 * Rules:
 *  - Leading `>` switches to commands mode (rest is the query).
 *  - Leading `@<alias>` filters Quick Open by kind (rest after the space is the query).
 *  - Otherwise: respect the `forcedMode` if provided, else default to `quick-open`.
 */
export function parseQuery(raw: string, forcedMode: PaletteMode = 'quick-open'): ParsedPaletteQuery {
  const trimmed = raw.replace(/^\s+/, '')

  if (trimmed.startsWith('>')) {
    return {
      mode: 'commands',
      kindFilter: null,
      cleanedQuery: trimmed.slice(1).trimStart(),
    }
  }

  if (trimmed.startsWith('@')) {
    const spaceIdx = trimmed.indexOf(' ')
    const aliasRaw = spaceIdx === -1 ? trimmed.slice(1) : trimmed.slice(1, spaceIdx)
    const alias = aliasRaw.toLowerCase()
    const kind = KIND_ALIASES[alias] ?? null
    if (kind) {
      return {
        mode: 'quick-open',
        kindFilter: kind,
        cleanedQuery: spaceIdx === -1 ? '' : trimmed.slice(spaceIdx + 1).trimStart(),
      }
    }
  }

  return { mode: forcedMode, kindFilter: null, cleanedQuery: trimmed }
}
