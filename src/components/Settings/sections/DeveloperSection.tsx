import { memo } from 'react'
import { Switch } from '@/components/ui/switch'
import { useSettingsStore } from '@/store/settings-store'
import { SettingRow } from '../components/SettingRow'

export const DeveloperSection = memo(function DeveloperSection(): React.JSX.Element {
  const devShowDebugTools = useSettingsStore((s) => s.devShowDebugTools)
  const setDevShowDebugTools = useSettingsStore((s) => s.setDevShowDebugTools)

  return (
    <>
      <SettingRow
        label="DevTools"
        description="Show the DevTools icon in the activity bar. Provides API Inspector, DB Explorer, Store Inspector, and AI Network Inspector in a unified panel."
      >
        <Switch checked={devShowDebugTools} onCheckedChange={setDevShowDebugTools} />
      </SettingRow>
    </>
  )
})
