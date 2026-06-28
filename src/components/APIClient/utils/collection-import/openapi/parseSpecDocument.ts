import { parse as parseYaml } from 'yaml'

/**
 * Parses raw spec text into an object, trying JSON first then YAML.
 * Returns `null` when the text is neither valid JSON nor valid YAML.
 * Pure / non-throwing — the caller decides how to react to `null`.
 */
export function parseSpecDocument(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    // fall through to YAML
  }

  try {
    return parseYaml(raw)
  } catch {
    return null
  }
}
