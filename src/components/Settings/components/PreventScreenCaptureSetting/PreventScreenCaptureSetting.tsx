import { memo } from 'react'
import { Switch } from '@/components/ui/switch'
import { useSettingsStore } from '@/store/settings-store'
import { SettingRow } from '../SettingRow'

export const PreventScreenCaptureSetting = memo(
  function PreventScreenCaptureSetting(): React.JSX.Element {
    const preventScreenCapture = useSettingsStore(
      (s) => s.securityPreventScreenCapture,
    )
    const setPreventScreenCapture = useSettingsStore(
      (s) => s.setSecurityPreventScreenCapture,
    )

    return (
      <SettingRow
        label="Prevent Screen Capture"
        description="Hide all Genisys windows from screenshots, screen recordings, and screen sharing. Captured frames appear blank. Note: this cannot block a physical camera photographing your screen, and has no effect on Linux."
      >
        <Switch
          checked={preventScreenCapture}
          onCheckedChange={setPreventScreenCapture}
        />
      </SettingRow>
    )
  },
)
