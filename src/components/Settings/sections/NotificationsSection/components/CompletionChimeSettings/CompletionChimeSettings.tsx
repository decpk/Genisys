import { memo } from 'react'

import { Switch } from '@/components/ui/switch'
import { SettingRow } from '@/components/Settings/components/SettingRow'

import { ChimeSoundRow } from './components/ChimeSoundRow'
import { useCompletionChimeSettingsData } from './useCompletionChimeSettingsData'

export const CompletionChimeSettings = memo(function CompletionChimeSettings(): React.JSX.Element {
  const data = useCompletionChimeSettingsData()
  const {
    playChimeOnCompletion,
    chimeSuccessSound,
    chimeErrorSound,
    setPlayChimeOnCompletion,
    setChimeSuccessSound,
    setChimeErrorSound,
  } = data

  return (
    <div className="pr-6 border-b border-border/50">
      <div className="pt-4 pb-2">
        <h2 className="text-sm font-semibold text-foreground">AI completion chime</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Play a short sound when an AI response or task finishes generating.
        </p>
      </div>

      <SettingRow
        label="Play sound when AI completes"
        description="A short chime fires after the chat or right-panel AI assistant finishes streaming a response."
      >
        <Switch
          checked={playChimeOnCompletion}
          onCheckedChange={setPlayChimeOnCompletion}
        />
      </SettingRow>

      <ChimeSoundRow
        variant="success"
        label="Success sound"
        description="Plays when an AI response completes normally."
        value={chimeSuccessSound}
        onChange={setChimeSuccessSound}
        disabled={!playChimeOnCompletion}
      />

      <ChimeSoundRow
        variant="error"
        label="Error sound"
        description="Plays when an AI response ends with an error."
        value={chimeErrorSound}
        onChange={setChimeErrorSound}
        disabled={!playChimeOnCompletion}
      />
    </div>
  )
})
