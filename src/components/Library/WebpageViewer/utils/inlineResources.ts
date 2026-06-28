import type { MhtmlResource } from './mhtml-parser.types'

/**
 * Replace resource URLs in HTML with inline data URIs from the parsed MHTML parts.
 */
export function inlineResources(html: string, resources: MhtmlResource[]): string {
  let result = html

  for (const resource of resources) {
    if (!resource.contentLocation || !resource.data) continue

    const dataUri = `data:${resource.contentType};base64,${resource.data}`
    const escapedUrl = escapeRegex(resource.contentLocation)

    // Replace both quoted and unquoted references
    const regex = new RegExp(escapedUrl, 'g')
    result = result.replace(regex, dataUri)
  }

  return result
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
