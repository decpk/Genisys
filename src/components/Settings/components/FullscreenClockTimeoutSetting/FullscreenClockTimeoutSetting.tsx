import { memo } from 'react'
import { useSettingsStore } from '@/store/settings-store'
import { SettingRow } from '../SettingRow'

const OPTIONS = [
  { value: 2000, label: '2s' },
  { value: 3000, label: '3s' },
  { value: 5000, label: '5s' },
  { value: 10000, label: '10s' },
  { value: 30000, label: '30s' },
  { value: 0, label: '∞' },
]

export const FullscreenClockTimeoutSetting = memo(function FullscreenClockTimeoutSetting(): React.JSX.Element {
  const timeoutMs = useSettingsStore((s) => s.fullscreenClockTimeoutMs)
  const setTimeoutMs = useSettingsStore((s) => s.setFullscreenClockTimeoutMs)

  return (
    <SettingRow
      label="Auto-Dismiss After"
      description="How long the fullscreen clock stays visible before it fades away. Mouse movement resets the timer. Choose ∞ to keep it open until you dismiss it manually (Escape / Enter / Space)."
    >
      <div className="flex rounded-md border border-border overflow-hidden">
        {OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTimeoutMs(value)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              timeoutMs === value
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
            }`}
            title={value === 0 ? 'Never auto-dismiss' : undefined}
          >
            {label}
          </button>
        ))}
      </div>
    </SettingRow>
  )
})
