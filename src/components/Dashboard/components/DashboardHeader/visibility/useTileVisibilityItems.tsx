import { useMemo } from 'react'

import { FolderGit2 } from 'lucide-react'

import { findAppItem } from '@/components/ActivityBar'
import type { DropdownItem } from '@/components/ui/dropdown/Dropdown.types'
import { useDashboardStore } from '@/store/dashboard-store'
import { useSettingsStore } from '@/store/settings-store'

import { TILE_ID_TO_APP } from '../../../registry/visibility'
import { TILE_VISIBILITY_OPTIONS } from './tile-visibility-options.constants'
import { TileVisibilitySwitch } from './TileVisibilitySwitch'

/**
 * Build dropdown items for the "Show / Hide tiles" group inside the
 * dashboard header `+` popover. Each row keeps the menu open on click and
 * toggles its visibility (clicking either the row or the trailing Switch
 * has the same effect).
 *
 * Includes the static singleton/grouped tiles plus one row per dynamic
 * project tile so *every* tile on the dashboard can be hidden.
 *
 * App-bound tiles (see `TILE_ID_TO_APP`) whose owner app is disabled show a
 * hint and cannot be toggled — the user must enable the app first.
 */
export function useTileVisibilityItems(): DropdownItem[] {
  const setTileVisibility = useSettingsStore((s) => s.setTileVisibility)
  const tileVisibility = useSettingsStore((s) => s.tileVisibility)
  const enabledApps = useSettingsStore((s) => s.enabledApps)
  const projects = useDashboardStore((s) => s.projects)

  return useMemo<DropdownItem[]>(() => {
    const staticItems = TILE_VISIBILITY_OPTIONS.map((opt) => {
      const visible = tileVisibility[opt.key] !== false
      const ownerApp = TILE_ID_TO_APP[opt.key]
      const appDisabled = ownerApp !== undefined && !enabledApps.includes(ownerApp)
      const appLabel = ownerApp ? findAppItem(ownerApp)?.label ?? ownerApp : ''
      return {
        key: `visibility-${opt.key}`,
        label: opt.label,
        icon: opt.icon,
        description: appDisabled ? `Enable the ${appLabel} app to use this tile` : undefined,
        keepOpenOnSelect: true,
        onSelect: appDisabled ? () => {} : () => setTileVisibility(opt.key, !visible),
        suffix: <TileVisibilitySwitch visibilityKey={opt.key} />,
      }
    })

    const projectItems = projects.map((project) => {
      const visible = tileVisibility[project.id] !== false
      return {
        key: `visibility-${project.id}`,
        label: project.name,
        icon: FolderGit2,
        keepOpenOnSelect: true,
        onSelect: () => setTileVisibility(project.id, !visible),
        suffix: <TileVisibilitySwitch visibilityKey={project.id} />,
      }
    })

    return [...staticItems, ...projectItems].sort((a, b) =>
      a.label.localeCompare(b.label),
    )
  }, [tileVisibility, setTileVisibility, projects, enabledApps])
}
