import { memo } from 'react'
import { useSettingsStore } from '@/store/settings-store'
import { SettingRow } from '../SettingRow'

const TIMEOUT_OPTIONS = [
  { value: 1, label: '1 min' },
  { value: 5, label: '5 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 0, label: 'Never' },
]

export const LockTimeoutSetting = memo(function LockTimeoutSetting(): React.JSX.Element {
  const securityEnabled = useSettingsStore((s) => s.securityEnabled)
  const lockTimeoutMinutes = useSettingsStore((s) => s.securityLockTimeoutMinutes)
  const setLockTimeout = useSettingsStore((s) => s.setSecurityLockTimeoutMinutes)

  if (!securityEnabled) return <></>

  return (
    <SettingRow
      label="Auto-lock Timeout"
      description="Lock the app after a period of inactivity. Set to Never to only lock manually or on other triggers."
    >
      <div className="flex rounded-md border border-border overflow-hidden">
        {TIMEOUT_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setLockTimeout(value)}
            className={`px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              lockTimeoutMinutes === value
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </SettingRow>
  )
})
