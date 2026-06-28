import { openExternalUrl } from '@/components/WebLinks/api/openExternalUrl'

/** Open a URL in the user's default browser. */
export async function openInBrowserAction(url: string): Promise<void> {
  await openExternalUrl(url)
}
