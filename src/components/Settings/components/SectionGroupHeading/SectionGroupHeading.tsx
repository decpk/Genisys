import { memo } from 'react'

import { useSettingsSearchContext } from '../../settings-search'

import type { SectionGroupHeadingProps } from './SectionGroupHeading.types'

export const SectionGroupHeading = memo(function SectionGroupHeading(
  props: SectionGroupHeadingProps
): React.JSX.Element | null {
  const { label } = props
  const search = useSettingsSearchContext()

  // Sub-headings add noise to the flat search results — hide them while searching.
  if (search.isActive) return null

  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/60 mt-6 mb-1 select-none">
      {label}
    </h3>
  )
})
