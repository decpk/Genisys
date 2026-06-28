import { memo } from 'react'
import { Switch } from '@/components/ui/switch'
import { useSettingsStore } from '@/store/settings-store'
import { SettingRow } from '../SettingRow'

export const NotesShowLabelsSetting = memo(function NotesShowLabelsSetting(): React.JSX.Element {
  const showLabels = useSettingsStore((s) => s.notesShowLabels)
  const setShowLabels = useSettingsStore((s) => s.setNotesShowLabels)

  return (
    <SettingRow
      label="Show labels"
      description="Display label badges on notes in the editor view. Toggle with ⇧⌘L."
    >
      <Switch checked={showLabels} onCheckedChange={setShowLabels} />
    </SettingRow>
  )
})
