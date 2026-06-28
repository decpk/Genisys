import { memo } from 'react'
import { Switch } from '@/components/ui/switch'
import { useSettingsStore } from '@/store/settings-store'
import { SettingRow } from '../SettingRow'

export const ExplorerSingleClickOpenSetting = memo(function ExplorerSingleClickOpenSetting(): React.JSX.Element {
  const singleClickOpen = useSettingsStore((s) => s.explorerSingleClickOpen)
  const setSingleClickOpen = useSettingsStore((s) => s.setExplorerSingleClickOpen)

  return (
    <SettingRow
      label="Single-click to open"
      description="When enabled, a single click opens files and folders. When disabled (default), single click selects an item and double-click opens it — matching Finder and Windows Explorer."
    >
      <Switch checked={singleClickOpen} onCheckedChange={setSingleClickOpen} />
    </SettingRow>
  )
})
