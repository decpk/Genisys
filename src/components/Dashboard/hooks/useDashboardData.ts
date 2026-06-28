import type { DashboardHeaderProps } from '../components/DashboardHeader/DashboardHeader.types'
import { useTileRegistry, type TileRegistry } from '../registry'
import { useDashboardDialogs } from './useDashboardDialogs'
import { useDashboardHeaderProps } from './useDashboardHeaderProps'
import { useDashboardLoaders } from './useDashboardLoaders'
import { useDashboardReorder } from './useDashboardReorder'

interface DashboardData {
  /** Tile registry — the ordered list of tiles to render. */
  registry: TileRegistry
  /** Stable `handleReorder` callback passed to `DashboardGrid`. */
  handleReorder: (orderedIds: string[]) => void
  /** Header props bag. */
  headerProps: DashboardHeaderProps
  /** Dialog props for AddProjectDialog and LiveSportsDialog. */
  dialogs: {
    liveSports: ReturnType<typeof useDashboardDialogs>['liveSports']
  }
}

/**
 * Top-level orchestrator hook for the Dashboard component.
 *
 * Composes:
 * - `useDashboardLoaders`     — kicks off store loads on mount
 * - `useDashboardPRs`         — *single* PR-fetching instance (shared)
 * - `useDashboardDialogs`     — AddProject + LiveSports dialog state
 * - `useTileRegistry`         — builds + orders the tile list
 * - `useDashboardReorder`     — persists drag-to-reorder
 * - `useDashboardHeaderProps` — derives header props
 *
 * The view (`Dashboard.tsx`) consumes only the returned shape and renders.
 */
export function useDashboardData(): DashboardData {
  useDashboardLoaders()

  const dialogs = useDashboardDialogs()

  const registry = useTileRegistry()

  const handleReorder = useDashboardReorder()

  const headerProps = useDashboardHeaderProps({
    openLiveSportsDialog: dialogs.openLiveSportsDialog,
  })

  return {
    registry,
    handleReorder,
    headerProps,
    dialogs: {
      liveSports: dialogs.liveSports,
    },
  }
}
