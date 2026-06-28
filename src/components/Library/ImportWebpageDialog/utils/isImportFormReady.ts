import type { ImportSource } from '../ImportWebpageDialog.types'

interface ImportReadyArgs {
  source: ImportSource
  url: string
  html: string
  fileContent: string
}

/** Whether the active source has enough input for the submit button to enable. */
export function isImportFormReady(args: ImportReadyArgs): boolean {
  const { source, url, html, fileContent } = args
  if (source === 'url') return url.trim().length > 0
  if (source === 'html') return html.trim().length > 0
  return fileContent.trim().length > 0
}
