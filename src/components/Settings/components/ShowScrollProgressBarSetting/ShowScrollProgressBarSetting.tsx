import { memo } from 'react'
import { Switch } from '@/components/ui/switch'
import { useSettingsStore } from '@/store/settings-store'
import { SettingRow } from '../SettingRow'

export const ShowScrollProgressBarSetting = memo(function ShowScrollProgressBarSetting(): React.JSX.Element {
  const showScrollProgressBar = useSettingsStore((s) => s.showScrollProgressBar)
  const setShowScrollProgressBar = useSettingsStore((s) => s.setShowScrollProgressBar)

  return (
    <SettingRow
      label="Show scroll progress bar"
      description="Display the thin scroll progress bar at the top of the content in Notes and the Library reader."
    >
      <Switch checked={showScrollProgressBar} onCheckedChange={setShowScrollProgressBar} />
    </SettingRow>
  )
})
