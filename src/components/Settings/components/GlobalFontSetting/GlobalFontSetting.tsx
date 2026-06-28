import { memo } from 'react'
import { ChevronDown } from 'lucide-react'
 import { useSettingsStore } from "@/store/settings-store";
import { FONT_CONFIG, READING_FONT_OPTIONS } from '@/lib/fonts'
import { SettingRow } from '../SettingRow'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

const FONT_STYLES = Object.fromEntries(
  Object.entries(FONT_CONFIG).map(([key, { family }]) => [key, { fontFamily: family }])
) as Record<keyof typeof FONT_CONFIG, { fontFamily: string }>

export const GlobalFontSetting = memo(function GlobalFontSetting(): React.JSX.Element {
  const globalFont = useSettingsStore((s) => s.globalFont)
  const setGlobalFont = useSettingsStore((s) => s.setGlobalFont)

  return (
    <SettingRow
      label="App font"
      description="Choose the default font family used across the entire application."
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-secondary/60 text-foreground hover:bg-secondary transition-colors cursor-pointer border border-border/40">
            <span style={FONT_STYLES[globalFont]}>
              {FONT_CONFIG[globalFont].label}
            </span>
            <ChevronDown size={12} />
          </button>
        </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={6}
            className="z-50 min-w-[160px] max-h-[min(400px,var(--radix-dropdown-menu-content-available-height))] overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95"
          >
            {READING_FONT_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onSelect={() => setGlobalFont(opt.value)}
                className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] cursor-pointer outline-none transition-colors ${
                  globalFont === opt.value
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground/80 hover:bg-secondary'
                }`}
              >
                <span style={FONT_STYLES[opt.value]}>
                  {opt.label}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
      </DropdownMenu>
    </SettingRow>
  )
})
