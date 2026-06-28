/**
 * Domain + store type declarations for the Previewer app.
 *
 * Declaration-only per project conventions — no runtime code lives here.
 */

/**
 * Embeddability verdict for a page, derived from its anti-framing response
 * headers (`X-Frame-Options`, CSP `frame-ancestors`).
 *
 * - `yes`     — safe to render inside a live `<iframe>`.
 * - `no`      — the site blocks framing; render the link card instead.
 * - `unknown` — could not determine (network/headers missing); caller decides.
 */
export type PreviewEmbeddable = 'yes' | 'no' | 'unknown'

/** Metadata extracted from a URL, used to render a preview. */
export interface LinkPreview {
  /** The URL that was requested (post-normalization). */
  url: string
  /** The URL after following redirects (may equal `url`). */
  finalUrl: string
  /** Page title (`og:title` ?? `<title>`). May be empty. */
  title: string
  /** Short description (`og:description` ?? `meta[name=description]`). */
  description: string
  /** Human-friendly site name (`og:site_name` ?? hostname). */
  siteName: string
  /** Absolute favicon URL, or empty when none was found. */
  faviconUrl: string
  /** Social card image (`og:image` ?? `twitter:image`), or empty. */
  imageUrl: string
  /** Brand/theme color (`meta[name=theme-color]`), or empty. */
  themeColor: string
  /** Whether the page may be embedded in a live iframe. */
  embeddable: PreviewEmbeddable
}

/** Lifecycle status of a preview fetch. */
export type PreviewFetchStatus = 'idle' | 'loading' | 'success' | 'error'

/** A folder/collection that saved previews can be grouped into. */
export interface PreviewFolder {
  /** UUID. */
  id: string
  /** Display name. */
  name: string
  /** Optional accent color (hex), or empty string when unset. */
  color: string
  /** Parent folder id for nesting, or null for a root-level folder. */
  parentId: string | null
  /** Manual ordering index within its parent. */
  sortOrder: number
  /** ISO timestamp. */
  createdAt: string
}

/** A preview the user has saved into their collection. */
export interface SavedPreview {
  /** UUID. */
  id: string
  /** Owning folder id, or null when unfiled. */
  folderId: string | null
  /** The URL the user saved. */
  url: string
  /** The URL after redirects. */
  finalUrl: string
  title: string
  description: string
  siteName: string
  faviconUrl: string
  imageUrl: string
  themeColor: string
  /** Embeddability verdict captured at save time. */
  embeddable: PreviewEmbeddable
  /** Optional free-text note, or empty string. */
  notes: string
  /** Manual ordering index. */
  sortOrder: number
  /** ISO timestamp the preview was saved. */
  createdAt: string
}

/** Field a saved-preview list can be sorted by. */
export type PreviewSortKey = 'dateAdded' | 'title' | 'siteName'

/** Identifier for a supported browser whose bookmarks can be imported. */
export type BrowserKind = 'chrome' | 'edge' | 'brave' | 'arc' | 'firefox' | 'safari'

/** A detected browser profile that bookmarks can be imported from. */
export interface BrowserBookmarkSource {
  /** Which browser this source belongs to. */
  browser: BrowserKind
  /** Profile directory name (e.g. "Default", "Profile 1"), or '' when N/A. */
  profile: string
  /** Human-friendly label, e.g. "Chrome — Default". */
  label: string
  /** Absolute path to the bookmark file/db this source reads from. */
  path: string
}

/** A single bookmark parsed from a browser. */
export interface BrowserBookmark {
  title: string
  url: string
  /** "/"-joined browser folder hierarchy the bookmark lived under, or ''. */
  folderPath: string
}

/** Outcome of a bookmark import: how many were saved vs. skipped as duplicates. */
export interface BookmarkImportResult {
  /** Number of bookmarks newly saved into the collection. */
  imported: number
  /** Number of bookmarks skipped because they already existed (same folder + URL). */
  duplicates: number
}

/** Sort direction for the saved-preview list. */
export type PreviewSortDirection = 'asc' | 'desc'

/**
 * Sidebar selection. `'all'` shows every saved preview, `'unfiled'` shows
 * previews with no folder, and any other value is a `PreviewFolder` id.
 */
export type PreviewFolderSelection = 'all' | 'unfiled' | (string & {})

export interface WebLinksStoreState {
  // ── Collections ──────────────────────────────────────────────
  /** All folders, ascending by `sortOrder`. */
  folders: PreviewFolder[]
  /** All saved previews (unfiltered/unsorted source list). */
  previews: SavedPreview[]
  /** Whether `loadAll` has completed at least once. */
  isLoaded: boolean
  /** Current sidebar selection driving the collection grid. */
  selectedFolder: PreviewFolderSelection
  /** Active sort field for the collection grid. */
  sortKey: PreviewSortKey
  /** Active sort direction for the collection grid. */
  sortDirection: PreviewSortDirection
  /** Free-text filter applied to the collection grid. */
  filterQuery: string
}

export interface WebLinksStoreActions {
  /** Quick-add a URL: fetch its metadata and save it straight into the collection. */
  addLink: (url: string, folderId: string | null) => Promise<SavedPreview>
  /** Open a URL in the user's default browser. */
  openInBrowser: (url: string) => Promise<void>

  // ── Collections ──────────────────────────────────────────────
  /** Load all folders + saved previews from the backend (once). */
  loadAll: () => Promise<void>
  /** Persist a fetched preview into a folder (or unfiled when null). */
  savePreview: (preview: LinkPreview, folderId: string | null) => Promise<SavedPreview>
  /** Re-fetch live metadata for a saved preview and persist it in place. */
  refreshPreviewMetadata: (previewId: string) => Promise<SavedPreview | null>
  /** Delete a saved preview by id. */
  deletePreview: (previewId: string) => Promise<void>
  /** Move a saved preview into a folder (or unfiled when null). */
  movePreview: (previewId: string, folderId: string | null) => Promise<void>
  /** Create a folder and return it. */
  createFolder: (name: string, color?: string, parentId?: string | null) => Promise<PreviewFolder>
  /** Rename an existing folder. */
  renameFolder: (folderId: string, name: string) => Promise<void>
  /** Delete a folder; its previews/subfolders become unfiled. */
  deleteFolder: (folderId: string) => Promise<void>
  /** Delete every saved preview and folder, wiping the whole collection. */
  clearAll: () => Promise<void>
  /** Set the active sidebar selection. */
  selectFolder: (selection: PreviewFolderSelection) => void
  /** Set the active sort field. */
  setSortKey: (key: PreviewSortKey) => void
  /** Set the active sort direction. */
  setSortDirection: (direction: PreviewSortDirection) => void
  /** Set the free-text filter query. */
  setFilterQuery: (query: string) => void

  // ── Bookmark import ──────────────────────────────────────────
  /** Detect installed browsers + profiles that bookmarks can be imported from. */
  loadBookmarkSources: () => Promise<BrowserBookmarkSource[]>
  /** Read + parse bookmarks from a specific browser source. */
  fetchBrowserBookmarks: (
    browser: BrowserKind,
    profilePath: string,
  ) => Promise<BrowserBookmark[]>
  /**
   * Save bookmarks into the collection; returns how many were imported and how
   * many were skipped as duplicates. When `preserveFolders` is true, each
   * bookmark is filed into a folder matching its browser folder name
   * (created/reused as needed) and `folderId` is the fallback for bookmarks that
   * had no browser folder.
   */
  importBookmarks: (
    bookmarks: BrowserBookmark[],
    folderId: string | null,
    preserveFolders: boolean,
  ) => Promise<BookmarkImportResult>

  // ── Screenshot → URLs (vision) ───────────────────────────────
  /** Extract candidate URLs from a screenshot (base64 data URL) via vision AI. */
  extractUrlsFromImage: (imageDataUrl: string) => Promise<string[]>
}
