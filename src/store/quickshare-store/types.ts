import type { QuickShareClient, QuickShareTrayItem } from '@/components/QuickShare/api'
import type {
  QuickShareDownloadAllResult,
  QuickShareZipAndSendResult,
} from '@/components/QuickShare/api'

export interface QuickShareStoreState {
  // ── server status ──────────────────────────────────────
  running: boolean
  url: string | null
  token: string | null
  ip: string | null
  port: number | null
  /** Folder where received files are auto-saved (Downloads/QuickShare). */
  storageDir: string | null
  // ── ui ────────────────────────────────────────────
  busy: boolean
  error: string | null
  // ── live data (initialised to [] so selectors stay reference-stable) ─────
  clients: QuickShareClient[]
  items: QuickShareTrayItem[]
}

export interface QuickShareStoreActions {
  /** Start the LAN sharing server. */
  start: (port?: number) => Promise<boolean>
  /** Stop sharing and disconnect all devices. */
  stop: () => Promise<void>
  refreshStatus: () => Promise<void>
  /** Share local files (by absolute path) into the tray. Returns count added.
   *  `target` is a recipient device id, or "everyone" (the default). */
  addFiles: (paths: string[], target?: string) => Promise<number>
  /** Share a text snippet / link into the tray, optionally to one recipient. */
  addText: (text: string, target?: string) => Promise<boolean>
  /** Remove an item from the tray (the saved file, if any, is kept on disk). */
  removeItem: (itemId: string) => Promise<void>
  /** Clear the entire tray (saved files are kept on disk). Returns count removed. */
  removeAll: () => Promise<number>
  /** Reveal a shared file in the OS file manager (Finder/Explorer). */
  revealItem: (itemId: string) => Promise<void>
  /** Copy every shared file into the QuickShare download folder. */
  downloadAll: () => Promise<QuickShareDownloadAllResult | null>
  /** Bundle every shared file into one zip and send it to a device (or everyone). */
  zipAndSend: (target?: string) => Promise<QuickShareZipAndSendResult | null>
  setError: (error: string | null) => void
  // ── event-driven (internal) setters ──────────────────────────────────────
  setClients: (clients: QuickShareClient[]) => void
  setItems: (items: QuickShareTrayItem[]) => void
}

export type QuickShareStore = QuickShareStoreState & QuickShareStoreActions
