import { memo } from 'react'
import { Switch } from '@/components/ui/switch'
import { useSettingsStore } from '@/store/settings-store'
import { SettingRow } from '../SettingRow'

export const ShowScrollPercentageSetting = memo(function ShowScrollPercentageSetting(): React.JSX.Element {
  const showScrollPercentage = useSettingsStore((s) => s.showScrollPercentage)
  const setShowScrollPercentage = useSettingsStore((s) => s.setShowScrollPercentage)

  return (
    <SettingRow
      label="Show scroll percentage"
      description="Display the scroll percentage while scrolling in Notes and the Library reader."
    >
      <Switch checked={showScrollPercentage} onCheckedChange={setShowScrollPercentage} />
    </SettingRow>
  )
})
