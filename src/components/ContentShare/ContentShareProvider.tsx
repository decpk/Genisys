import { useContentShareData } from './hooks/useContentShareData'
import { IncomingShareDialog } from './IncomingShareDialog'

/**
 * Mount once at the app root. Wires the Content Share Tauri events, auto-starts
 * the LAN service so this device can receive shares, and renders the global
 * receiver approval dialog.
 */
export function ContentShareProvider() {
  useContentShareData()
  return <IncomingShareDialog />
}
