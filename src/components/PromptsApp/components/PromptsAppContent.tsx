import { usePromptsAppContentData } from '../hooks/usePromptsAppContentData'
import type { PromptsAppData } from '../PromptsApp.types'

import { PromptsAppBreadcrumb } from './PromptsAppBreadcrumb'
import { PromptsAppBrowse } from './PromptsAppBrowse'
import { PromptsAppPromptViewer } from './PromptsAppPromptViewer'
import { PromptsAppTabBar } from './PromptsAppTabBar'

interface PromptsAppContentProps {
  data: PromptsAppData
}

/**
 * Top-level layout for the PromptsApp surface. Renders the persistent
 * tab strip and breadcrumb above the content area; the content area
 * shows either the Browse view or — when a prompt tab is active — the
 * in-tab prompt viewer.
 */
export function PromptsAppContent(
  props: PromptsAppContentProps,
): React.JSX.Element {
  const { data } = props
  const { activePromptTabId, activePrompt } = usePromptsAppContentData()

  const showViewer = activePromptTabId !== null && activePrompt !== null

  let body: React.JSX.Element
  if (showViewer) {
    body = <PromptsAppPromptViewer prompt={activePrompt} data={data} />
  } else {
    body = <PromptsAppBrowse data={data} />
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <PromptsAppTabBar data={data} />
      <PromptsAppBreadcrumb data={data} />
      <div className="min-h-0 flex-1">{body}</div>
    </div>
  )
}
