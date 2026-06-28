import { memo } from 'react'
import { ChevronDown } from 'lucide-react'
import { useSettingsStore } from '@/store/settings-store'
import { SettingRow } from '../SettingRow'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

const LANGUAGE_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'es', label: 'Español (Spanish)' },
  { value: 'fr', label: 'Français (French)' },
  { value: 'de', label: 'Deutsch (German)' },
  { value: 'ja', label: '日本語 (Japanese)' },
  { value: 'zh', label: '中文 (Chinese)' },
  { value: 'ko', label: '한국어 (Korean)' },
  { value: 'ar', label: 'العربية (Arabic)' },
  { value: 'pt', label: 'Português (Portuguese)' },
  { value: 'ru', label: 'Русский (Russian)' },
] as const

export const VoiceLanguageSetting = memo(function VoiceLanguageSetting(): React.JSX.Element {
  const voiceLanguage = useSettingsStore((s) => s.voiceLanguage)
  const setVoiceLanguage = useSettingsStore((s) => s.setVoiceLanguage)

  const currentLabel = LANGUAGE_OPTIONS.find((o) => o.value === voiceLanguage)?.label ?? 'Auto-detect'

  return (
    <SettingRow
      label="Voice Language"
      description="Language for speech recognition. Auto-detect works for most languages but selecting a specific language may improve accuracy."
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-secondary/60 text-foreground hover:bg-secondary transition-colors cursor-pointer border border-border/40">
            <span>{currentLabel}</span>
            <ChevronDown size={12} />
          </button>
        </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={6}
            className="z-50 min-w-[180px] max-h-[min(400px,var(--radix-dropdown-menu-content-available-height))] overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95"
          >
            {LANGUAGE_OPTIONS.map((opt) => {
              const isSelected = voiceLanguage === opt.value

              return (
                <DropdownMenuItem
                  key={opt.value}
                  onSelect={() => setVoiceLanguage(opt.value)}
                  className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] cursor-pointer outline-none transition-colors ${
                    isSelected
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground/80 hover:bg-secondary'
                  }`}
                >
                  {opt.label}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
      </DropdownMenu>
    </SettingRow>
  )
})
