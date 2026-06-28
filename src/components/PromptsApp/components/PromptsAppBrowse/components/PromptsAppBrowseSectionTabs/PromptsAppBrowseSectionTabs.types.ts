import type { PromptsAppBrowseSection } from '../../PromptsAppBrowse.types'

export interface PromptsAppBrowseSectionTabsProps {
  activeSection: PromptsAppBrowseSection
  onChange: (section: PromptsAppBrowseSection) => void
}

export interface PromptsAppBrowseSectionDescriptor {
  value: PromptsAppBrowseSection
  label: string
}
