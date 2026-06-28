import { memo, useState } from 'react'
import { KeyRound } from 'lucide-react'
import { useSettingsStore } from '@/store/settings-store'
import { Button } from '@/components/ui/button'
import { SettingRow } from '../SettingRow'
import { SetPasswordDialog } from '../SetPasswordDialog/SetPasswordDialog'

export const SetPasswordSetting = memo(function SetPasswordSetting(): React.JSX.Element {
  const securityEnabled = useSettingsStore((s) => s.securityEnabled)
  const securityType = useSettingsStore((s) => s.securityType)
  const [dialogOpen, setDialogOpen] = useState(false)

  if (!securityEnabled) return <></>

  return (
    <>
      <SettingRow
        label={securityType === 'pin' ? 'Change PIN' : 'Change Password'}
        description={`Update your current ${securityType === 'pin' ? 'PIN' : 'password'}. You'll need to enter your current one first.`}
      >
        <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
          <KeyRound className="w-3.5 h-3.5 mr-1.5" />
          Change
        </Button>
      </SettingRow>

      <SetPasswordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode="change"
      />
    </>
  )
})
