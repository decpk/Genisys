/**
 * Load the raw HTML content of a saved webpage by id. Throws when the
 * backend returns no content so callers can surface a load error.
 */
export async function loadWebpageHtml(id: string): Promise<string> {
  const html = await window.api.loadWebpageContent(id)
  if (html == null) {
    throw new Error(`Failed to load webpage content for "${id}"`)
  }
  return html
}
