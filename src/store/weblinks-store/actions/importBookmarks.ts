import type {
  BookmarkImportResult,
  BrowserBookmark,
  SavedPreview,
  WebLinksStoreActions,
  WebLinksStoreState,
} from '@/components/WebLinks/WebLinks.types'
import { savePreviews } from '@/components/WebLinks/api/savePreviews'
import { savePreview } from '@/components/WebLinks/api/savePreview'
import { fetchLinkPreview } from '@/components/WebLinks/api/fetchLinkPreview'
import { getHostname } from '@/components/WebLinks/utils/getHostname'

/**
 * Leaf (last) segment of a "/"-joined browser folder path, trimmed; '' when the
 * path has no usable segment (e.g. a bookmark at the root of the bookmarks bar).
 */
function leafFolderName(folderPath: string): string {
  const segments = folderPath
    .split('/')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
  return segments.length > 0 ? segments[segments.length - 1] : ''
}

/**
 * Ensure a collection folder exists for every distinct browser-folder leaf name
 * referenced by `bookmarks`, reusing folders that already match by name
 * (case-insensitive) and creating the rest via the store's `createFolder`
 * (which persists + appends to the store). Returns a lowercased-name → id map.
 */
async function ensureFoldersByName(
  get: () => WebLinksStoreState & WebLinksStoreActions,
  bookmarks: BrowserBookmark[],
): Promise<Map<string, string>> {
  const nameToId = new Map<string, string>()
  for (const folder of get().folders) {
    nameToId.set(folder.name.toLowerCase(), folder.id)
  }

  const namesToCreate: string[] = []
  const seen = new Set<string>()
  for (const bookmark of bookmarks) {
    const leaf = leafFolderName(bookmark.folderPath)
    if (!leaf) continue
    const key = leaf.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    if (!nameToId.has(key)) namesToCreate.push(leaf)
  }

  for (const name of namesToCreate) {
    const folder = await get().createFolder(name)
    nameToId.set(name.toLowerCase(), folder.id)
  }

  return nameToId
}

/** Resolve a bookmark's target folder id given an optional name → id map. */
function resolveFolderId(
  bookmark: BrowserBookmark,
  folderByName: Map<string, string> | null,
  fallbackFolderId: string | null,
): string | null {
  if (!folderByName) return fallbackFolderId
  const leaf = leafFolderName(bookmark.folderPath)
  if (!leaf) return fallbackFolderId
  return folderByName.get(leaf.toLowerCase()) ?? fallbackFolderId
}

/** Stable key identifying a preview by its folder + URL, for de-duplication. */
function folderUrlKey(folderId: string | null, url: string): string {
  return `${folderId ?? ''}\u0000${url.trim()}`
}

/**
 * Background-resolve full metadata for freshly-imported previews so their cards
 * gain real favicons, preview images, and brand colours — matching links added
 * one at a time. Runs with a small concurrency pool and swallows per-item
 * failures (dead links, auth walls, network errors), leaving the synthesized
 * banner in place. The user's bookmark title is preserved; only empty or
 * URL-derived fields are filled in.
 */
async function enrichImportedPreviews(
  set: (partial: Partial<WebLinksStoreState>) => void,
  get: () => WebLinksStoreState & WebLinksStoreActions,
  ids: string[],
): Promise<void> {
  const CONCURRENCY = 4
  let cursor = 0

  async function resolveOne(id: string): Promise<void> {
    const current = get().previews.find((p) => p.id === id)
    if (!current) return

    const fresh = await fetchLinkPreview(current.url || current.finalUrl).catch(() => null)
    if (!fresh) return

    // Re-read in case the preview was edited or deleted while fetching.
    const latest = get().previews.find((p) => p.id === id)
    if (!latest) return

    const hasCuratedTitle = Boolean(latest.title) && latest.title !== latest.url
    const updated: SavedPreview = {
      ...latest,
      finalUrl: fresh.finalUrl || latest.finalUrl,
      title: hasCuratedTitle ? latest.title : fresh.title || latest.title,
      description: fresh.description || latest.description,
      siteName: fresh.siteName || latest.siteName,
      faviconUrl: fresh.faviconUrl || latest.faviconUrl,
      imageUrl: fresh.imageUrl || latest.imageUrl,
      themeColor: fresh.themeColor || latest.themeColor,
      embeddable: fresh.embeddable,
    }

    try {
      await savePreview(updated)
    } catch {
      return
    }
    set({ previews: get().previews.map((p) => (p.id === id ? updated : p)) })
  }

  async function worker(): Promise<void> {
    while (cursor < ids.length) {
      const id = ids[cursor]
      cursor += 1
      await resolveOne(id)
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, ids.length) }, () => worker()))
}

/**
 * Convert browser bookmarks into saved previews (title + url up front, then
 * resolve favicon/preview-image/theme metadata in the background), persist them
 * in one bulk call, append them to the store, and return how many were imported
 * alongside how many were skipped as duplicates.
 *
 * Bookmarks without a usable URL are skipped (and excluded from the duplicate
 * count), as are duplicates — a bookmark whose URL already exists in its target
 * folder (either an existing saved preview or an earlier bookmark in the same
 * import batch) is not re-imported and is counted as a duplicate.
 *
 * When `preserveFolders` is true, each bookmark is filed into a collection
 * folder matching its browser folder name (reusing or creating folders as
 * needed); bookmarks that had no browser folder fall back to `folderId`.
 */
export async function importBookmarksAction(
  set: (partial: Partial<WebLinksStoreState>) => void,
  get: () => WebLinksStoreState & WebLinksStoreActions,
  bookmarks: BrowserBookmark[],
  folderId: string | null,
  preserveFolders: boolean,
): Promise<BookmarkImportResult> {
  const usable = bookmarks.filter((b) => b.url.trim().length > 0)
  if (usable.length === 0) return { imported: 0, duplicates: 0 }

  const folderByName = preserveFolders ? await ensureFoldersByName(get, usable) : null

  const base = get().previews
  const now = new Date().toISOString()

  // Seed the seen-set with existing previews so duplicates (same URL in the
  // same folder) are never re-imported; new keys are added as we go to also
  // dedupe within this batch.
  const seenKeys = new Set<string>()
  for (const preview of base) {
    seenKeys.add(folderUrlKey(preview.folderId, preview.url))
  }

  const toSave: SavedPreview[] = []
  for (const b of usable) {
    const targetFolderId = resolveFolderId(b, folderByName, folderId)
    const key = folderUrlKey(targetFolderId, b.url)
    if (seenKeys.has(key)) continue
    seenKeys.add(key)
    toSave.push({
      id: crypto.randomUUID(),
      folderId: targetFolderId,
      url: b.url,
      finalUrl: b.url,
      title: b.title || b.url,
      description: '',
      siteName: getHostname(b.url),
      faviconUrl: '',
      imageUrl: '',
      themeColor: '',
      embeddable: 'unknown',
      notes: '',
      sortOrder: base.length + toSave.length,
      createdAt: now,
    })
  }

  if (toSave.length === 0) return { imported: 0, duplicates: usable.length }

  await savePreviews(toSave)
  set({ previews: [...get().previews, ...toSave] })
  // Resolve full metadata (favicon, preview image, theme colour) for the freshly
  // imported bookmarks in the background so their cards match individually-added
  // links — without delaying the import result the dialog reports.
  void enrichImportedPreviews(
    set,
    get,
    toSave.map((p) => p.id),
  )
  return { imported: toSave.length, duplicates: usable.length - toSave.length }
}
