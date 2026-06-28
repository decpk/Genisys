import { memo } from 'react'
import { Switch } from '@/components/ui/switch'
import { useSettingsStore } from '@/store/settings-store'
import { SettingRow } from '../SettingRow'

export const ExplorerHideFoldersSetting = memo(function ExplorerHideFoldersSetting(): React.JSX.Element {
  const hideFolders = useSettingsStore((s) => s.explorerHideFolders)
  const setHideFolders = useSettingsStore((s) => s.setExplorerHideFolders)

  return (
    <SettingRow
      label="Hide folders"
      description="When enabled, folders are hidden by default in the Explorer, showing only files. Useful for quickly browsing file contents without folder nesting."
    >
      <Switch checked={hideFolders} onCheckedChange={setHideFolders} />
    </SettingRow>
  )
})
