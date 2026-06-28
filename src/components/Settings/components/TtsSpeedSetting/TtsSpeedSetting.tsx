import { memo } from 'react'
import { useSettingsStore } from '@/store/settings-store'
import { SettingRow } from '../SettingRow'

const SPEED_OPTIONS = [
  { value: 0.5, label: '0.5x' },
  { value: 0.75, label: '0.75x' },
  { value: 1.0, label: '1x' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 1.75, label: '1.75x' },
  { value: 2.0, label: '2x' },
] as const

export const TtsSpeedSetting = memo(function TtsSpeedSetting(): React.JSX.Element {
  const ttsSpeed = useSettingsStore((s) => s.ttsSpeed)
  const setTtsSpeed = useSettingsStore((s) => s.setTtsSpeed)

  return (
    <SettingRow
      label="TTS Speed"
      description="Playback speed for text-to-speech. 1x is normal speed."
    >
      <div className="flex items-center gap-2">
        {SPEED_OPTIONS.map((opt) => {
          const isSelected = ttsSpeed === opt.value

          return (
            <button
              key={opt.value}
              onClick={() => setTtsSpeed(opt.value)}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-primary/10 text-primary border border-primary/30'
                  : 'bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </SettingRow>
  )
})
