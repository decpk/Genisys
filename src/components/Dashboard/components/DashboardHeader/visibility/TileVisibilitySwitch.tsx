import { Switch } from '@/components/ui/switch'
import { useSettingsStore } from '@/store/settings-store'

import { TILE_ID_TO_APP } from '../../../registry/visibility'

interface TileVisibilitySwitchProps {
  /** Visibility map key (tile id, or grouped key like `__live_sports__`). */
  visibilityKey: string
}

/**
 * Small radix Switch wired to `useSettingsStore.tileVisibility`.
 * Stops pointer events from bubbling so toggling does not also fire the
 * parent dropdown row's `onSelect`.
 *
 * When the tile belongs to an app (see `TILE_ID_TO_APP`) that is currently
 * disabled, the switch is disabled — the user must enable the app first.
 */
export function TileVisibilitySwitch({ visibilityKey }: TileVisibilitySwitchProps): React.JSX.Element {
  const visible = useSettingsStore((s) => s.tileVisibility[visibilityKey] !== false)
  const setTileVisibility = useSettingsStore((s) => s.setTileVisibility)
  const ownerApp = TILE_ID_TO_APP[visibilityKey]
  const appDisabled = useSettingsStore(
    (s) => ownerApp !== undefined && !s.enabledApps.includes(ownerApp),
  )

  return (
    <span
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className="inline-flex items-center"
    >
      <Switch
        checked={visible}
        disabled={appDisabled}
        onCheckedChange={(v) => {
          if (appDisabled) return
          setTileVisibility(visibilityKey, v)
        }}
      />
    </span>
  )
}
