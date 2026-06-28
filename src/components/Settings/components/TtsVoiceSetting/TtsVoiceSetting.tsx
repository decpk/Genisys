import { memo, useState, useEffect } from 'react'
import { ChevronDown, Volume2 } from 'lucide-react'
import { useSettingsStore } from '@/store/settings-store'
import { useTextToSpeechContext } from '@/components/TextToSpeech'
import { SettingRow } from '../SettingRow'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

interface TtsVoiceOption {
  id: string
  label: string
}

export const TtsVoiceSetting = memo(function TtsVoiceSetting(): React.JSX.Element {
  const ttsVoice = useSettingsStore((s) => s.ttsVoice)
  const setTtsVoice = useSettingsStore((s) => s.setTtsVoice)
  const tts = useTextToSpeechContext()

  const [voices, setVoices] = useState<TtsVoiceOption[]>([])

  useEffect(() => {
    void window.api.ttsListVoices().then((result: any) => {
      setVoices(result?.voices ?? [])
    })
  }, [])

  const currentLabel = voices.find((v) => v.id === ttsVoice)?.label ?? ttsVoice

  function handlePreview(voiceId: string) {
    tts.speak('Hello, this is a preview of the selected voice.')
  }

  return (
    <SettingRow
      label="TTS Voice"
      description="Choose a voice for text-to-speech. 26 voices across 9 languages available."
    >
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-secondary/60 text-foreground hover:bg-secondary transition-colors cursor-pointer border border-border/40 max-w-[220px]">
              <span className="truncate">{currentLabel}</span>
              <ChevronDown size={12} className="shrink-0" />
            </button>
          </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={6}
              className="z-50 min-w-[220px] max-h-[min(400px,var(--radix-dropdown-menu-content-available-height))] overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95"
            >
              {voices.map((voice) => {
                const isSelected = ttsVoice === voice.id

                return (
                  <DropdownMenuItem
                    key={voice.id}
                    onSelect={() => setTtsVoice(voice.id)}
                    className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] cursor-pointer outline-none transition-colors ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-foreground/80 hover:bg-secondary'
                    }`}
                  >
                    {voice.label}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
        </DropdownMenu>
        <button
          onClick={() => handlePreview(ttsVoice)}
          className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer"
          title="Preview voice"
        >
          <Volume2 size={14} />
        </button>
      </div>
    </SettingRow>
  )
})
