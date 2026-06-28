import { memo } from 'react'
import { ChevronDown } from 'lucide-react'

import { useSettingsStore } from '@/store/settings-store'
import { LANGUAGE_OPTIONS } from '@/lib/languages'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

import { SettingRow } from '../SettingRow'

export const LibraryDefaultLanguageSetting = memo(function LibraryDefaultLanguageSetting(): React.JSX.Element {
  const libraryDefaultLanguage = useSettingsStore((s) => s.libraryDefaultLanguage)
  const setLibraryDefaultLanguage = useSettingsStore((s) => s.setLibraryDefaultLanguage)

  const currentLabel =
    LANGUAGE_OPTIONS.find((o) => o.value === libraryDefaultLanguage)?.label ?? 'English'

  return (
    <SettingRow
      label="Default book language"
      description="Pre-selected language when creating a new book or generating chapters. You can still change it per book in the New Book dialog."
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
          {LANGUAGE_OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onSelect={() => setLibraryDefaultLanguage(opt.value)}
              className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] cursor-pointer outline-none transition-colors ${
                libraryDefaultLanguage === opt.value
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground/80 hover:bg-secondary'
              }`}
            >
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SettingRow>
  )
})
