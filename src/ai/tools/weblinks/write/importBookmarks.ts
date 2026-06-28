import { useWebLinksStore } from '@/store/weblinks-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import type { BrowserBookmark } from '@/components/WebLinks/WebLinks.types'
import { formatBookmarkImportMessage } from './utils/formatBookmarkImportMessage'

/** Browsers this tool can import from (matches the JSON-schema enum). */
const SUPPORTED_BROWSERS = ['chrome', 'edge', 'brave', 'firefox', 'safari'] as const

const tool: ToolModule = {
  name: 'previewer_import_bookmarks',
  definition: {
    type: 'function',
    function: {
      name: 'previewer_import_bookmarks',
      description:
        'Import bookmarks from an installed browser into the saved collection. Detects the browser profile, reads its bookmarks, and files them under a folder (or unfiled).',
      parameters: {
        type: 'object',
        properties: {
          browser: {
            type: 'string',
            enum: ['chrome', 'edge', 'brave', 'firefox', 'safari'],
            description: 'Which browser to import bookmarks from.',
          },
          profilePath: {
            type: 'string',
            description:
              'Optional exact profile path from a detected source. When omitted, the first matching profile for the browser is used.',
          },
          folderId: {
            type: ['string', 'null'],
            description:
              'Optional folder id to file imported bookmarks under. Omit, null, or "unfiled" leaves them unfiled. Used as the fallback folder when preserveFolders is true.',
          },
          preserveFolders: {
            type: 'boolean',
            description:
              "When true, recreate the browser's bookmark folders by name (reusing existing same-named folders) and file each bookmark into its matching folder. Defaults to false.",
          },
        },
        required: ['browser'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const browser = typeof args.browser === 'string' ? args.browser : ''
    if (!(SUPPORTED_BROWSERS as readonly string[]).includes(browser)) {
      return {
        kind: 'error',
        message: 'browser must be one of chrome, edge, brave, firefox, safari.',
      }
    }

    const store = useWebLinksStore.getState()
    const sources = await store.loadBookmarkSources()

    const profilePath =
      typeof args.profilePath === 'string' && args.profilePath ? args.profilePath : undefined
    const source = profilePath
      ? sources.find((s) => s.path === profilePath)
      : sources.find((s) => s.browser === browser)

    if (!source) {
      return { kind: 'error', message: `No ${browser} bookmark profile found.` }
    }

    let bookmarks: BrowserBookmark[]
    try {
      bookmarks = await useWebLinksStore
        .getState()
        .fetchBrowserBookmarks(source.browser, source.path)
    } catch (caught) {
      return { kind: 'error', message: caught instanceof Error ? caught.message : String(caught) }
    }

    const raw = args.folderId
    const folderId =
      raw === undefined || raw === null || raw === '' || raw === 'unfiled' ? null : (raw as string)

    const result = await useWebLinksStore
      .getState()
      .importBookmarks(bookmarks, folderId, args.preserveFolders === true)

    return {
      kind: 'success',
      message: formatBookmarkImportMessage(result, source.label),
    }
  },
}

export default tool
