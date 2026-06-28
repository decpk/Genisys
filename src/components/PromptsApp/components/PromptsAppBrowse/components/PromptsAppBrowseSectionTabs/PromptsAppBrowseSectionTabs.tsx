import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import type { PromptsAppBrowseSection } from '../../PromptsAppBrowse.types'
import { PROMPTS_APP_BROWSE_SECTIONS } from './constants'
import type { PromptsAppBrowseSectionTabsProps } from './PromptsAppBrowseSectionTabs.types'

/**
 * Pill-style section selector rendered above the prompt grid in the
 * Browse view: `All | Recents | Favorites | Built-in`. The active
 * value lives in the Browse hook so it survives section switches but
 * resets cleanly when the user navigates away from PromptsApp.
 */
export function PromptsAppBrowseSectionTabs(
  props: PromptsAppBrowseSectionTabsProps,
): React.JSX.Element {
  const { activeSection, onChange } = props

  return (
    <div className="px-6 pb-1 pt-3">
      <Tabs
        value={activeSection}
        onValueChange={(v) => onChange(v as PromptsAppBrowseSection)}
      >
        <TabsList>
          {PROMPTS_APP_BROWSE_SECTIONS.map((section) => (
            <TabsTrigger key={section.value} value={section.value}>
              {section.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
