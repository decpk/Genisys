import { useMemo } from 'react'
import { Palette } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'

import { Dropdown, type DropdownGroup } from '@/components/ui/dropdown'
import { Tooltip } from '@/components/Tooltip'
import { IconButton } from '@/components/ui/icon-button'
import { useThemeStore } from '@/store/theme-store'
import { useThemeCatalogStore } from '@/store/theme-catalog-store'
import { buildThemeDropdownGroups } from '@/themes/utils/buildThemeDropdownGroups'

import { activityBarLabelButtonClass } from '@/components/ActivityBar/ActivityBar.constants'

import type { ThemeSwitcherProps } from './ThemeSwitcher.types'

export function ThemeSwitcher({ isCompact, size = 20, side = 'top', tooltipSide = 'right', showLabel = false, labelLeftAlign = false }: ThemeSwitcherProps): React.JSX.Element {
  const activeThemeId = useThemeStore((s) => s.activeThemeId)
  const setTheme = useThemeStore((s) => s.setTheme)
  const customThemes = useThemeCatalogStore(useShallow((s) => s.customThemes))

  const groups: DropdownGroup[] = useMemo(
    () => buildThemeDropdownGroups(activeThemeId, setTheme, customThemes),
    [activeThemeId, setTheme, customThemes]
  )

  const trigger = showLabel ? (
    <button type="button" className={activityBarLabelButtonClass(labelLeftAlign)}>
      <Palette size={20} />
      <span className="text-sm font-medium">Theme</span>
    </button>
  ) : (
    <IconButton
      size={size <= 16 ? 'md' : 'lg'}
      className="text-muted-foreground/55 hover:text-foreground/80"
    >
      <Palette size={size} />
    </IconButton>
  )

  const wrappedTrigger = showLabel ? (
    trigger
  ) : isCompact ? (
    <Tooltip content="Theme" side={tooltipSide}>
      {trigger}
    </Tooltip>
  ) : (
    trigger
  )

  return (
    <Dropdown
      openOn="click"
      groups={groups}
      align="left"
      side={side}
      menuWidth="224px"
      maxHeight="70vh"
      menuClassName="sidebar-theme"
      trigger={wrappedTrigger}
      fill={showLabel && labelLeftAlign}
      keepOpenOnSelect
    />
  )
}
