import { TIMER_THEMES } from '@/components/Timer/constants/timerThemes'

import { ThemeRingTile } from './components/ThemeRingTile'
import type { ThemeSettingsSectionProps } from './ThemeSettingsSection.types'

export function ThemeSettingsSection(
  props: ThemeSettingsSectionProps,
): React.JSX.Element {
  const { settings, onChange } = props

  const handleSelect = (themeId: string) => {
    onChange({ themeId })
  }

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {TIMER_THEMES.map((theme) => (
        <ThemeRingTile
          key={theme.id}
          theme={theme}
          isActive={settings.themeId === theme.id}
          onSelect={handleSelect}
        />
      ))}
    </div>
  )
}
