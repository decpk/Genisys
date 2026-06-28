import { memo } from 'react'
import { Switch } from '@/components/ui/switch'
import { useSettingsStore } from '@/store/settings-store'
import { SettingRow } from '../SettingRow'

export const ExplorerShowHiddenSetting = memo(function ExplorerShowHiddenSetting(): React.JSX.Element {
  const showHidden = useSettingsStore((s) => s.explorerShowHidden)
  const setShowHidden = useSettingsStore((s) => s.setExplorerShowHidden)

  return (
    <SettingRow
      label="Show hidden files"
      description="When enabled, hidden files and folders (names starting with a dot) are visible by default in the Explorer for local repositories."
    >
      <Switch checked={showHidden} onCheckedChange={setShowHidden} />
    </SettingRow>
  )
})
