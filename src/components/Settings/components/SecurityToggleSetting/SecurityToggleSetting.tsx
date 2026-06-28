import { memo, useState, useCallback } from 'react'
import { Switch } from '@/components/ui/switch'
import { useSettingsStore } from '@/store/settings-store'
import { verifyPassword } from '@/lib/crypto'
import { SettingRow } from '../SettingRow'
import { SetPasswordDialog } from '../SetPasswordDialog/SetPasswordDialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const SecurityToggleSetting = memo(function SecurityToggleSetting(): React.JSX.Element {
  const securityEnabled = useSettingsStore((s) => s.securityEnabled)
  const securityHash = useSettingsStore((s) => s.securityHash)
  const securitySalt = useSettingsStore((s) => s.securitySalt)
  const securityType = useSettingsStore((s) => s.securityType)
  const setSecurityEnabled = useSettingsStore((s) => s.setSecurityEnabled)
  const setSecurityCredentials = useSettingsStore((s) => s.setSecurityCredentials)

  const [setupOpen, setSetupOpen] = useState(false)
  const [disableOpen, setDisableOpen] = useState(false)
  const [disablePassword, setDisablePassword] = useState('')
  const [disableError, setDisableError] = useState('')
  const [disabling, setDisabling] = useState(false)

  const handleToggle = useCallback((checked: boolean) => {
    if (checked) {
      setSetupOpen(true)
    } else {
      setDisableOpen(true)
    }
  }, [])

  const handleDisable = useCallback(async () => {
    if (!disablePassword) return
    setDisabling(true)
    setDisableError('')

    const isValid = await verifyPassword(disablePassword, securityHash, securitySalt)
    if (isValid) {
      setSecurityEnabled(false)
      setSecurityCredentials('', '')
      setDisableOpen(false)
      setDisablePassword('')
    } else {
      setDisableError('Incorrect ' + (securityType === 'pin' ? 'PIN' : 'password'))
    }
    setDisabling(false)
  }, [disablePassword, securityHash, securitySalt, securityType, setSecurityEnabled, setSecurityCredentials])

  return (
    <>
      <SettingRow
        label="App Lock"
        description="Protect your app with a password or PIN. When enabled, a lock screen will appear based on your configured triggers."
      >
        <Switch checked={securityEnabled} onCheckedChange={handleToggle} />
      </SettingRow>

      <SetPasswordDialog
        open={setupOpen}
        onOpenChange={setSetupOpen}
        mode="setup"
      />

      {/* Disable confirmation dialog */}
      <Dialog open={disableOpen} onOpenChange={(o) => { setDisableOpen(o); if (!o) { setDisablePassword(''); setDisableError('') } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Disable App Lock</DialogTitle>
            <DialogDescription>
              Enter your current {securityType === 'pin' ? 'PIN' : 'password'} to disable security.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Input
              type="password"
              value={disablePassword}
              onChange={(e) => { setDisablePassword(e.target.value); if (disableError) setDisableError('') }}
              placeholder={securityType === 'pin' ? 'Enter PIN' : 'Enter password'}
              autoComplete="off"
              onKeyDown={(e) => { if (e.key === 'Enter') handleDisable() }}
            />
            {disableError && (
              <p className="text-sm text-destructive mt-2">{disableError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDisableOpen(false); setDisablePassword(''); setDisableError('') }} disabled={disabling}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDisable} disabled={disabling || !disablePassword}>
              {disabling ? 'Verifying…' : 'Disable'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
})
