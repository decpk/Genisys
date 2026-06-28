import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { ChevronDown } from 'lucide-react'

import { Dropdown, type DropdownGroup } from '@/components/ui/dropdown'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/store/theme-store'
import { useThemeCatalogStore } from '@/store/theme-catalog-store'
import { findThemeById } from '@/themes/utils/findThemeById'
import { buildThemeDropdownGroups } from '@/themes/utils/buildThemeDropdownGroups'

import { SettingRow } from '../SettingRow'

export function ActiveThemeSetting(): React.JSX.Element {
  const activeThemeId = useThemeStore((s) => s.activeThemeId)
  const setTheme = useThemeStore((s) => s.setTheme)
  const customThemes = useThemeCatalogStore(useShallow((s) => s.customThemes))

  const groups: DropdownGroup[] = useMemo(
    () => buildThemeDropdownGroups(activeThemeId, setTheme, customThemes),
    [activeThemeId, setTheme, customThemes],
  )

  const activeTheme = findThemeById(activeThemeId)
  const triggerLabel = activeTheme?.name ?? 'Default'
  const previewSwatchColor = activeTheme?.colors.primary ?? 'transparent'

  const trigger = (
    <Button variant="outline" size="sm" className="gap-2 min-w-[160px] justify-between">
      <span className="flex items-center gap-2 truncate">
        <span
          className="size-3 shrink-0 rounded-full border border-border"
          style={{ backgroundColor: previewSwatchColor }}
        />
        <span className="truncate">{triggerLabel}</span>
      </span>
      <ChevronDown size={12} />
    </Button>
  )

  return (
    <SettingRow
      label="Active theme"
      description="Pick a built-in theme or one of your custom themes. Custom themes appear under their own group when you create them."
    >
      <Dropdown
        openOn="click"
        groups={groups}
        align="right"
        side="bottom"
        menuWidth="240px"
        maxHeight="60vh"
        trigger={trigger}
      />
    </SettingRow>
  )
}
