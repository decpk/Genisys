import { memo } from 'react'
import { useSettingsStore } from '@/store/settings-store'
import { SettingRow } from '../SettingRow'

const OPTIONS = [
  { value: 3, label: '3' },
  { value: 5, label: '5' },
  { value: 10, label: '10' },
]

export const MaxFailedAttemptsSetting = memo(function MaxFailedAttemptsSetting(): React.JSX.Element {
  const securityEnabled = useSettingsStore((s) => s.securityEnabled)
  const maxAttempts = useSettingsStore((s) => s.securityMaxFailedAttempts)
  const setMaxAttempts = useSettingsStore((s) => s.setSecurityMaxFailedAttempts)

  if (!securityEnabled) return <></>

  return (
    <SettingRow
      label="Max Failed Attempts"
      description="Number of incorrect attempts before a 30-second lockout is triggered."
    >
      <div className="flex rounded-md border border-border overflow-hidden">
        {OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setMaxAttempts(value)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              maxAttempts === value
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
