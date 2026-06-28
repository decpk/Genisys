import { PromptsAppBrowseTab } from '../PromptsAppBrowseTab'
import { PromptsAppTab } from '../PromptsAppTab'

import type { PromptsAppTabBarProps } from './PromptsAppTabBar.types'
import { usePromptsAppTabBarData } from './usePromptsAppTabBarData'

/**
 * Horizontal tab strip that sits at the top of the PromptsApp surface.
 * The first tab is the permanent Browse tab; every subsequent tab is an
 * open prompt. The strip scrolls horizontally when the number of tabs
 * exceeds the available width — mirrors the MockServer endpoint tab
 * bar.
 */
export function PromptsAppTabBar(
  props: PromptsAppTabBarProps,
): React.JSX.Element {
  const { data } = props
  const tabBar = usePromptsAppTabBarData(data)

  return (
    <div className="flex h-9 w-full items-end border-b border-border bg-muted/15">
      <div className="flex h-9 min-w-0 flex-1 items-end overflow-x-auto scrollbar-thin">
        <PromptsAppBrowseTab
          isActive={tabBar.activePromptTabId === null}
          onSelect={tabBar.handleSelectBrowse}
        />
        {tabBar.tabPrompts.map((prompt) => (
          <PromptsAppTab
            key={prompt.id}
            prompt={prompt}
            isActive={tabBar.activePromptTabId === prompt.id}
            folderColor={tabBar.folderColorByPromptId[prompt.id]}
            onActivate={tabBar.handleActivate}
            onClose={tabBar.handleClose}
            onCloseOthers={tabBar.handleCloseOthers}
            onCloseAll={tabBar.handleCloseAll}
            onCopy={tabBar.handleCopy}
          />
        ))}
      </div>
    </div>
  )
}
