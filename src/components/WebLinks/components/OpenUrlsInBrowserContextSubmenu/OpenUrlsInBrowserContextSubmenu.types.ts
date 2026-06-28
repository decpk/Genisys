import type { BrowserApp } from '@/tauri-api-bridge'

/** Props for the "Open all in browser" context-menu submenu. */
export interface OpenUrlsInBrowserContextSubmenuProps {
  /** Installed browsers to offer, in addition to the system default. */
  browsers: BrowserApp[]
  /** Disable the trigger (e.g. when there are no URLs to open). */
  disabled?: boolean
  /** Open all URLs in the chosen browser, or the system default when omitted. */
  onOpen: (browser?: BrowserApp) => void
}
