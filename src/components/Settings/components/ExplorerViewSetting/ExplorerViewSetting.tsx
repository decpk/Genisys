import { memo } from 'react'
import { ButtonGroup } from '@/components/ui/button-group'
import { useSettingsStore } from '@/store/settings-store'
import { EXPLORER_VIEW_OPTIONS } from '../../Settings.constants'
import { SettingRow } from '../SettingRow'

const VIEW_OPTIONS = EXPLORER_VIEW_OPTIONS.map((mode) => ({
  value: mode,
  label: mode.charAt(0).toUpperCase() + mode.slice(1),
}))

export const ExplorerViewSetting = memo(function ExplorerViewSetting(): React.JSX.Element {
  const defaultExplorerView = useSettingsStore((s) => s.defaultExplorerView)
  const setDefaultExplorerView = useSettingsStore((s) => s.setDefaultExplorerView)

  return (
    <SettingRow
      label="Default explorer view"
      description="Controls the initial layout of the file explorer when browsing repository contents. Choose from list, grid, detailed, compact, or thumbnail views."
    >
      <ButtonGroup
        options={VIEW_OPTIONS}
        value={defaultExplorerView}
        onChange={setDefaultExplorerView}
      />
    </SettingRow>
  )
})
