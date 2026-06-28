import { memo } from 'react'

import { useSettingsSearchContext } from '../../settings-search'
import { normalizeSettingLabel } from '../../settings-search/utils/normalizeSettingLabel'
import type { SettingRowProps } from '../../Settings.types'

import { matchesSettingSearch } from './utils/matchesSettingSearch'

const warnedMissingLabels = new Set<string>()

export const SettingRow = memo(function SettingRow(
  props: SettingRowProps,
): React.JSX.Element | null {
  const { label, description, children } = props
  const search = useSettingsSearchContext()

  if (search.isActive) {
    if (import.meta.env.DEV) {
      const normalized = normalizeSettingLabel(label)
      if (!search.allLabels.has(normalized) && !warnedMissingLabels.has(normalized)) {
        warnedMissingLabels.add(normalized)
        console.warn(`[settings-search] Setting "${label}" is missing from the search index.`)
      }
    }
    if (!matchesSettingSearch(search, label, description)) {
      return null
    }
  }

  return (
    <div className="flex items-start justify-between gap-10 py-5">
      <div className="min-w-0 flex-1 max-w-md">
        <p className="text-sm font-medium text-foreground select-none">{label}</p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed select-none">
          {description}
        </p>
      </div>
      <div className="shrink-0 pt-0.5">{children}</div>
    </div>
  )
})
