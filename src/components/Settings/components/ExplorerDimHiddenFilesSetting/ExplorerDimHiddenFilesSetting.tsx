import { memo } from 'react'
import { Switch } from '@/components/ui/switch'
import { useSettingsStore } from '@/store/settings-store'
import { SettingRow } from '../SettingRow'

export const ExplorerDimHiddenFilesSetting = memo(function ExplorerDimHiddenFilesSetting(): React.JSX.Element {
  const dimHiddenFiles = useSettingsStore((s) => s.explorerDimHiddenFiles)
  const setDimHiddenFiles = useSettingsStore((s) => s.setExplorerDimHiddenFiles)

  return (
    <SettingRow
      label="Dim hidden files"
      description="When enabled, hidden files (names starting with a dot) are rendered with reduced opacity in the Explorer when Show hidden files is on."
    >
      <Switch checked={dimHiddenFiles} onCheckedChange={setDimHiddenFiles} />
    </SettingRow>
  )
})
