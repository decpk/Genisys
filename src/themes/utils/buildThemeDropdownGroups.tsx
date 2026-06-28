import { User } from 'lucide-react'

import { THEMES } from '@/themes'
import type { Theme } from '@/themes/themes.types'
import type { DropdownGroup, DropdownItem } from '@/components/ui/dropdown'

function makeThemeItem(
  theme: Theme,
  activeThemeId: string,
  onSelect: (id: string) => void,
): DropdownItem {
  let suffix: React.ReactNode | undefined
  if (theme.isCustom) {
    suffix = (
      <span
        className="ml-auto inline-flex items-center gap-1 text-[9px] font-medium uppercase tracking-wider leading-none px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground"
        title="Custom theme"
      >
        <User size={9} />
        custom
      </span>
    )
  }

  return {
    key: theme.id,
    label: theme.name,
    active: activeThemeId === theme.id,
    prefix: (
      <span
        className="shrink-0 size-3 rounded-full border border-border"
        style={{ backgroundColor: theme.colors.primary }}
      />
    ),
    suffix,
    onSelect: () => onSelect(theme.id),
  }
}

export function buildThemeDropdownGroups(
  activeThemeId: string,
  onSelect: (themeId: string) => void,
  customThemes: ReadonlyArray<Theme> = [],
): DropdownGroup[] {
  const byName = (a: Theme, b: Theme): number => a.name.localeCompare(b.name)
  const light = THEMES.filter((t) => !t.isDark).sort(byName)
  const dark = THEMES.filter((t) => t.isDark).sort(byName)

  const groups: DropdownGroup[] = [
    {
      key: 'light',
      label: 'Light',
      items: light.map((t) => makeThemeItem(t, activeThemeId, onSelect)),
    },
    {
      key: 'dark',
      label: 'Dark',
      items: dark.map((t) => makeThemeItem(t, activeThemeId, onSelect)),
    },
  ]

  if (customThemes.length > 0) {
    groups.push({
      key: 'custom',
      label: 'Custom',
      items: [...customThemes].sort(byName).map((t) => makeThemeItem(t, activeThemeId, onSelect)),
    })
  }

  return groups
}
