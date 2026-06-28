import type { MhtmlResource } from './mhtml-parser.types'
import { extractBoundary } from './extractBoundary'
import { parseMhtmlPart } from './parseMhtmlPart'
import { decodeQuotedPrintable } from './decodeQuotedPrintable'
import { inlineResources } from './inlineResources'
import { injectThemeOverride, type ThemeOverride } from './injectDarkTheme'

/**
 * Parse an MHTML document and produce a self-contained HTML string
 * with all sub-resources inlined as data URIs.
 */
export function parseMhtml(
  mhtmlContent: string,
  themeOverride: ThemeOverride | null,
): string {
  const boundary = extractBoundary(mhtmlContent)
  if (!boundary) return mhtmlContent

  const parts = mhtmlContent.split(`--${boundary}`)
  let mainHtml = ''
  const resources: MhtmlResource[] = []

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i]

    // Skip the final boundary marker
    if (part.trimStart().startsWith('--')) continue

    const parsed = parseMhtmlPart(part)
    if (!parsed) continue

    const isHtml = parsed.contentType.includes('text/html')

    if (isHtml && !mainHtml) {
      // Decode the main HTML part
      mainHtml =
        parsed.encoding.toLowerCase() === 'quoted-printable'
          ? decodeQuotedPrintable(parsed.body)
          : parsed.body
    } else {
      // Sub-resource — keep as base64
      const data =
        parsed.encoding.toLowerCase() === 'base64'
          ? parsed.body.replace(/\s/g, '')
          : btoa(parsed.body)

      resources.push({
        contentType: parsed.contentType.split(';')[0].trim(),
        contentLocation: parsed.contentLocation,
        data,
      })
    }
  }

  if (!mainHtml) return ''

  let result = inlineResources(mainHtml, resources)

  if (themeOverride) {
    result = injectThemeOverride(result, themeOverride)
  }

  return result
}
