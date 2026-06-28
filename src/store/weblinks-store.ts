import { create } from 'zustand'

import type {
  WebLinksStoreState,
  WebLinksStoreActions,
} from '@/components/WebLinks/WebLinks.types'

import { openInBrowserAction } from './weblinks-store/actions/openInBrowser'
import { addLinkAction } from './weblinks-store/actions/addLink'
import { loadAllAction } from './weblinks-store/actions/loadAll'
import { savePreviewAction } from './weblinks-store/actions/savePreview'
import { refreshPreviewMetadataAction } from './weblinks-store/actions/refreshPreviewMetadata'
import { deletePreviewAction } from './weblinks-store/actions/deletePreview'
import { movePreviewAction } from './weblinks-store/actions/movePreview'
import { createFolderAction } from './weblinks-store/actions/createFolder'
import { renameFolderAction } from './weblinks-store/actions/renameFolder'
import { deleteFolderAction } from './weblinks-store/actions/deleteFolder'
import { clearAllAction } from './weblinks-store/actions/clearAll'
import { selectFolderAction } from './weblinks-store/actions/selectFolder'
import { setSortKeyAction } from './weblinks-store/actions/setSortKey'
import { setSortDirectionAction } from './weblinks-store/actions/setSortDirection'
import { setFilterQueryAction } from './weblinks-store/actions/setFilterQuery'
import { loadBookmarkSourcesAction } from './weblinks-store/actions/loadBookmarkSources'
import { fetchBrowserBookmarksAction } from './weblinks-store/actions/fetchBrowserBookmarks'
import { importBookmarksAction } from './weblinks-store/actions/importBookmarks'
import { extractUrlsFromImageAction } from './weblinks-store/actions/extractUrlsFromImage'

/**
 * WebLinks app store — wiring manifest only.
 *
 * State fields + thin action wrappers that delegate to the extracted service
 * functions under `weblinks-store/actions/`. No business logic lives here.
 */
export const useWebLinksStore = create<WebLinksStoreState & WebLinksStoreActions>()(
  (set, get) => ({
    // ── Collections state ────────────────────────────────────────
    folders: [],
    previews: [],
    isLoaded: false,
    selectedFolder: 'all',
    sortKey: 'dateAdded',
    sortDirection: 'desc',
    filterQuery: '',

    // ── Quick-add + open ─────────────────────────────────────────
    addLink: (url, folderId) => addLinkAction(get, url, folderId),
    openInBrowser: (url) => openInBrowserAction(url),

    // ── Collections actions ──────────────────────────────────────
    loadAll: () => loadAllAction(set),
    savePreview: (preview, folderId) => savePreviewAction(set, get, preview, folderId),
    refreshPreviewMetadata: (previewId) => refreshPreviewMetadataAction(set, get, previewId),
    deletePreview: (previewId) => deletePreviewAction(set, get, previewId),
    movePreview: (previewId, folderId) => movePreviewAction(set, get, previewId, folderId),
    createFolder: (name, color, parentId) =>
      createFolderAction(set, get, name, color, parentId),
    renameFolder: (folderId, name) => renameFolderAction(set, get, folderId, name),
    deleteFolder: (folderId) => deleteFolderAction(set, get, folderId),
    clearAll: () => clearAllAction(set),
    selectFolder: (selection) => selectFolderAction(set, selection),
    setSortKey: (key) => setSortKeyAction(set, key),
    setSortDirection: (direction) => setSortDirectionAction(set, direction),
    setFilterQuery: (query) => setFilterQueryAction(set, query),
    loadBookmarkSources: () => loadBookmarkSourcesAction(),
    fetchBrowserBookmarks: (browser, profilePath) =>
      fetchBrowserBookmarksAction(browser, profilePath),
    importBookmarks: (bookmarks, folderId, preserveFolders) =>
      importBookmarksAction(set, get, bookmarks, folderId, preserveFolders),
    extractUrlsFromImage: (imageDataUrl) => extractUrlsFromImageAction(imageDataUrl),
  }),
)
