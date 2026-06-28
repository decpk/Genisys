import { useState } from 'react'
import { Bell, Palette, Timer, Volume2 } from 'lucide-react'

import { Accordion } from '@/components/ui/accordion'

import { BehaviorSettingsSection } from './components/BehaviorSettingsSection'
import { DefaultDurationsSection } from './components/DefaultDurationsSection'
import { SettingsCard } from './components/SettingsCard'
import { SettingsPanelHero } from './components/SettingsPanelHero'
import { SoundSettingsSection } from './components/SoundSettingsSection'
import { ThemeSettingsSection } from './components/ThemeSettingsSection'
import { useSettingsPanelData } from './hooks/useSettingsPanelData'
import { SETTINGS_DEFAULT_OPEN_SECTIONS, SETTINGS_SECTION_IDS } from './SettingsPanel.constants'

export function SettingsPanel(): React.JSX.Element {
  const data = useSettingsPanelData()
  const [openSections, setOpenSections] = useState<string[]>([
    ...SETTINGS_DEFAULT_OPEN_SECTIONS,
  ])

  const ensureOpen = (id: string) => {
    setOpenSections((prev) => {
      if (prev.includes(id)) return prev
      return [...prev, id]
    })
  }

  const handleThemeChipClick = () => ensureOpen(SETTINGS_SECTION_IDS.theme)
  const handleSoundChipClick = () => ensureOpen(SETTINGS_SECTION_IDS.sound)

  return (
    <div className="flex flex-col h-full overflow-y-auto p-3 gap-3">
      <SettingsPanelHero
        settings={data.settings}
        onThemeChipClick={handleThemeChipClick}
        onSoundChipClick={handleSoundChipClick}
      />
      <Accordion
        type="multiple"
        variant="subtle"
        value={openSections}
        onValueChange={setOpenSections}
        className="flex flex-col gap-2"
      >
        <SettingsCard
          id={SETTINGS_SECTION_IDS.durations}
          icon={Timer}
          title="Default durations"
          description="Work, break, and long break lengths"
        >
          <DefaultDurationsSection
            settings={data.settings}
            onChange={data.updateSettings}
          />
        </SettingsCard>
        <SettingsCard
          id={SETTINGS_SECTION_IDS.theme}
          icon={Palette}
          title="Theme"
          description="Color used for the timer ring"
        >
          <ThemeSettingsSection
            settings={data.settings}
            onChange={data.updateSettings}
          />
        </SettingsCard>
        <SettingsCard
          id={SETTINGS_SECTION_IDS.sound}
          icon={Volume2}
          title="Sound"
          description="Tone played when a phase completes"
        >
          <SoundSettingsSection
            settings={data.settings}
            onChange={data.updateSettings}
          />
        </SettingsCard>
        <SettingsCard
          id={SETTINGS_SECTION_IDS.behavior}
          icon={Bell}
          title="Behavior"
          description="Notifications, auto-start, and visuals"
        >
          <BehaviorSettingsSection
            settings={data.settings}
            onChange={data.updateSettings}
          />
        </SettingsCard>
      </Accordion>
    </div>
  )
}
