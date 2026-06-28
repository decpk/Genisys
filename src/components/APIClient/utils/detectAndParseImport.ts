import { detectImportFormat, parseImport } from './import-parsers'
import type { ImportFormat } from './import-parsers'
import type { ParsedRequest } from './curl-parser'

export interface DetectedImport {
  format: ImportFormat
  parsed: ParsedRequest
}

/**
 * Detects whether `input` is a recognized request snippet (cURL, raw HTTP,
 * fetch, axios, HTTPie, PowerShell, python-requests, wget) and, if so, parses
 * it into a `ParsedRequest`. Returns `null` when the input is not a recognized
 * format (e.g. a plain URL).
 */
export async function detectAndParseImport(input: string): Promise<DetectedImport | null> {
  const format = detectImportFormat(input)
  if (!format) return null
  const parsed = await parseImport(format, input)
  return { format, parsed }
}
