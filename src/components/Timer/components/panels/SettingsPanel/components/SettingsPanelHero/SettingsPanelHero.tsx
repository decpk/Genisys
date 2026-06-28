import { HERO_BODY, HERO_HEADER, HERO_LEFT, HERO_RIGHT, HERO_TITLE, HERO_WRAPPER } from './SettingsPanelHero.styles'
import type { SettingsPanelHeroProps } from './SettingsPanelHero.types'
import { HeroDurationPills } from './components/HeroDurationPills'
import { HeroSoundChip } from './components/HeroSoundChip'
import { HeroThemeChip } from './components/HeroThemeChip'
import { useSettingsPanelHeroData } from './useSettingsPanelHeroData'

export function SettingsPanelHero(props: SettingsPanelHeroProps): React.JSX.Element {
  const { settings, onThemeChipClick, onSoundChipClick } = props
  const data = useSettingsPanelHeroData(settings)

  const isMuted = settings.soundProfileId === 'none'

  return (
    <div className={HERO_WRAPPER}>
      <div className={HERO_HEADER}>
        <span className={HERO_TITLE}>Current setup</span>
      </div>
      <div className={HERO_BODY}>
        <div className={HERO_LEFT}>
          <HeroDurationPills
            workMin={data.workMin}
            shortBreakMin={data.shortBreakMin}
            longBreakMin={data.longBreakMin}
            sessionsBetweenLongBreak={data.sessionsBetweenLongBreak}
          />
        </div>
        <div className={HERO_RIGHT}>
          <HeroThemeChip
            color={data.themeColor}
            label={data.themeLabel}
            onClick={onThemeChipClick}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <HeroSoundChip
          label={data.soundLabel}
          isMuted={isMuted}
          onClick={onSoundChipClick}
        />
      </div>
    </div>
  )
}
