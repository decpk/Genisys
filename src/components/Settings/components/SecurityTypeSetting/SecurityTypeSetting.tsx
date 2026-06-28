import { memo, useState, useCallback } from 'react'
import { useSettingsStore, type SecurityType } from '@/store/settings-store'
import { SettingRow } from '../SettingRow'
import { SetPasswordDialog } from '../SetPasswordDialog/SetPasswordDialog'

const OPTIONS: { value: SecurityType; label: string }[] = [
  { value: 'password', label: 'Password' },
  { value: 'pin', label: 'PIN' },
]

export const SecurityTypeSetting = memo(function SecurityTypeSetting(): React.JSX.Element {
  const securityType = useSettingsStore((s) => s.securityType)
  const securityEnabled = useSettingsStore((s) => s.securityEnabled)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingType, setPendingType] = useState<SecurityType>('password')

  const handleChange = useCallback((type: SecurityType) => {
    if (type === securityType) return
    setPendingType(type)
    setDialogOpen(true)
  }, [securityType])

  if (!securityEnabled) return <></>

  return (
    <>
      <SettingRow
        label="Lock Type"
        description="Choose between a numeric PIN or an alphanumeric password."
      >
        <div className="flex rounded-md border border-border overflow-hidden">
          {OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleChange(value)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                securityType === value
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </SettingRow>

      <SetPasswordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode="change"
        targetType={pendingType}
      />
    </>
  )
})
