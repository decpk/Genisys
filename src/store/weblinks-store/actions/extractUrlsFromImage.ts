import { extractUrlsFromImage } from '@/components/WebLinks/api/extractUrlsFromImage'

/**
 * Extract candidate URLs from a screenshot (base64 data URL) using the backend
 * vision model. Stateless passthrough — the screenshot-import dialog holds the
 * transient result list locally.
 */
export async function extractUrlsFromImageAction(imageDataUrl: string): Promise<string[]> {
  return extractUrlsFromImage(imageDataUrl)
}
