import { TIMER_SOUNDS } from '@/components/Timer/constants/timerSounds'

import { SoundCard } from './components/SoundCard'
import type { SoundSettingsSectionProps } from './SoundSettingsSection.types'
import { useSoundSettingsSectionData } from './useSoundSettingsSectionData'

export function SoundSettingsSection(
  props: SoundSettingsSectionProps,
): React.JSX.Element {
  const { settings, onChange } = props
  const { previewingId, previewSound } = useSoundSettingsSectionData()

  const handleSelect = (soundId: string) => {
    onChange({ soundProfileId: soundId })
  }

  return (
    <div className="grid grid-cols-2 gap-1.5">
      {TIMER_SOUNDS.map((sound) => (
        <SoundCard
          key={sound.id}
          sound={sound}
          isSelected={settings.soundProfileId === sound.id}
          isPlaying={previewingId === sound.id}
          onSelect={handleSelect}
          onPreview={previewSound}
        />
      ))}
    </div>
  )
}
