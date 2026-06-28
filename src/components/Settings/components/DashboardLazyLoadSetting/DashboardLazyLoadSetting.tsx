import { memo } from 'react'
import { Switch } from '@/components/ui/switch'
import { useSettingsStore } from '@/store/settings-store'
import { SettingRow } from '../SettingRow'

export const DashboardLazyLoadSetting = memo(function DashboardLazyLoadSetting(): React.JSX.Element {
  const lazyLoadTabs = useSettingsStore((s) => s.dashboardLazyLoadTabs)
  const setLazyLoadTabs = useSettingsStore((s) => s.setDashboardLazyLoadTabs)

  return (
    <SettingRow
      label="Lazy load dashboard tabs"
      description="Only fetch pull requests for a tab when you click on it, instead of loading all tabs upfront. This reduces the number of API calls on startup and improves initial load time — especially useful when you have many projects on the dashboard."
    >
      <Switch checked={lazyLoadTabs} onCheckedChange={setLazyLoadTabs} />
    </SettingRow>
  )
})
