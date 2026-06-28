import { PromptsAppEmptyState } from '../PromptsAppEmptyState'
import { PromptsAppHero } from '../PromptsAppHero'
import { PromptsAppPromptGrid } from '../PromptsAppPromptGrid'
import { PromptsAppToolbar } from '../PromptsAppToolbar'

import { PromptsAppBrowseSectionTabs } from './components/PromptsAppBrowseSectionTabs'
import { PromptsAppCategoryRail } from './components/PromptsAppCategoryRail'
import type { PromptsAppBrowseProps } from './PromptsAppBrowse.types'
import { usePromptsAppBrowseData } from './usePromptsAppBrowseData'
import { resolveBrowseBody } from './utils/resolveBrowseBody'

/**
 * The Browse "tab" of the PromptsApp surface. Layout: a vertical
 * `PromptsAppCategoryRail` is rendered to the right of the left
 * sidebar (replacing the previous horizontally-scrolling chip strip),
 * followed by the main scroll column containing Hero, Toolbar, the
 * section tab strip (`All | Recents | Favorites | Built-in`), and the
 * prompt grid (or empty state).
 */
export function PromptsAppBrowse(
  props: PromptsAppBrowseProps,
): React.JSX.Element {
  const { data } = props
  const browse = usePromptsAppBrowseData(data)
  const body = resolveBrowseBody(browse.scopedData)

  return (
    <div className="flex h-full min-h-0 flex-row overflow-hidden">
      <PromptsAppCategoryRail data={data} />
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto">
        <PromptsAppHero data={data} />
        <PromptsAppToolbar
          data={data}
          sortOption={browse.sortOption}
          onSortChange={browse.setSortOption}
        />
        <PromptsAppBrowseSectionTabs
          activeSection={browse.activeSection}
          onChange={browse.setActiveSection}
        />
        {body === 'grid' && <PromptsAppPromptGrid data={browse.scopedData} />}
        {body === 'no-data' && (
          <PromptsAppEmptyState
            variant="no-data"
            onNewPrompt={() =>
              data.openPromptDialog({ folderId: data.activeFolder?.id })
            }
            onNewFolder={() => data.openFolderDialog()}
          />
        )}
        {body === 'no-search-results' && (
          <PromptsAppEmptyState
            variant="no-search-results"
            onNewPrompt={() =>
              data.openPromptDialog({ folderId: data.activeFolder?.id })
            }
            onNewFolder={() => data.openFolderDialog()}
            searchQuery={data.searchQuery.trim()}
          />
        )}
        {body === 'empty-folder' && (
          <PromptsAppEmptyState
            variant="empty-folder"
            onNewPrompt={() =>
              data.openPromptDialog({ folderId: data.activeFolder?.id })
            }
            onNewFolder={() => data.openFolderDialog()}
          />
        )}
      </div>
    </div>
  )
}
