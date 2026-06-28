import { memo } from 'react'
import { ChevronDown } from 'lucide-react'
import { useSettingsStore, type BookmarkViewMode } from '@/store/settings-store'
import { SettingRow } from '../SettingRow'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

const BOOKMARK_VIEW_OPTIONS: { value: BookmarkViewMode; label: string }[] = [
  { value: 'grouped', label: 'Grouped by book' },
  { value: 'flat', label: 'Flat list' },
  { value: 'recent', label: 'Recent first' },
]

const BOOKMARK_LABEL_MAP = Object.fromEntries(
  BOOKMARK_VIEW_OPTIONS.map((o) => [o.value, o.label])
) as Record<BookmarkViewMode, string>

export const LibraryBookmarkViewSetting = memo(function LibraryBookmarkViewSetting(): React.JSX.Element {
  const libraryDefaultBookmarkView = useSettingsStore((s) => s.libraryDefaultBookmarkView)
  const setLibraryDefaultBookmarkView = useSettingsStore((s) => s.setLibraryDefaultBookmarkView)

  const currentLabel = BOOKMARK_LABEL_MAP[libraryDefaultBookmarkView] ?? 'Flat list'

  return (
    <SettingRow
      label="Default bookmark view"
      description="Choose the default view mode for the bookmarks sidebar in the Library."
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
            className="z-50 min-w-[160px] rounded-lg border border-border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95"
          >
            {BOOKMARK_VIEW_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onSelect={() => setLibraryDefaultBookmarkView(opt.value)}
                className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] cursor-pointer outline-none transition-colors ${
                  libraryDefaultBookmarkView === opt.value
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
