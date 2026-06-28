import { memo } from 'react'
import { Switch } from '@/components/ui/switch'
import { useSettingsStore } from '@/store/settings-store'
import { SettingRow } from '../SettingRow'

export const ExplorerMixFoldersWithFilesSetting = memo(function ExplorerMixFoldersWithFilesSetting(): React.JSX.Element {
  const mixFoldersWithFiles = useSettingsStore((s) => s.explorerMixFoldersWithFiles)
  const setMixFoldersWithFiles = useSettingsStore((s) => s.setExplorerMixFoldersWithFiles)

  return (
    <SettingRow
      label="Mix folders with files"
      description="When enabled, folders and files are sorted together using the current sort field. When disabled, folders always appear before files."
    >
      <Switch checked={mixFoldersWithFiles} onCheckedChange={setMixFoldersWithFiles} />
    </SettingRow>
  )
})
