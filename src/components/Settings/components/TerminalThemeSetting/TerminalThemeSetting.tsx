import { ChevronDown } from 'lucide-react'
import { memo, Fragment } from 'react'

import {
  findTerminalThemeById,
  TERMINAL_THEME_GROUPS,
  TerminalThemeSwatch,
} from '@/components/TerminalApp/terminalThemes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { SettingRow } from '../SettingRow'

import { useTerminalThemeSettingData } from './useTerminalThemeSettingData'

const ITEM_BASE =
  'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] cursor-pointer outline-none transition-colors'
const ITEM_ACTIVE = `${ITEM_BASE} bg-primary/10 text-primary font-medium`
const ITEM_INACTIVE = `${ITEM_BASE} text-foreground/80 hover:bg-secondary`

/**
 * Default terminal color scheme for the standalone Terminal app. Applies to
 * every terminal that doesn't have its own per-tab theme; `null` ("Follow app
 * theme") falls back to the active Genisys theme.
 */
export const TerminalThemeSetting = memo(function TerminalThemeSetting(): React.JSX.Element {
  const { value, setValue } = useTerminalThemeSettingData()
  const active = findTerminalThemeById(value)
  const label = active?.name ?? 'Follow app theme'

  return (
    <SettingRow
      label="Terminal theme"
      description="Default color scheme for terminals in the Terminal app. A tab's own theme overrides this."
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-secondary/60 text-foreground hover:bg-secondary transition-colors cursor-pointer border border-border/40">
            {active ? <TerminalThemeSwatch theme={active} /> : null}
            <span>{label}</span>
            <ChevronDown size={12} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={6}
          className="z-50 min-w-[220px] max-h-[min(420px,var(--radix-dropdown-menu-content-available-height))] overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95"
        >
          <DropdownMenuItem
            onSelect={() => setValue(null)}
            className={value == null ? ITEM_ACTIVE : ITEM_INACTIVE}
          >
            <span className="inline-block h-[14px] w-[26px] shrink-0" aria-hidden="true" />
            Follow app theme
          </DropdownMenuItem>
          {TERMINAL_THEME_GROUPS.map((group) => (
            <Fragment key={group.group}>
              <div className="px-2.5 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/60 select-none">
                {group.group}
              </div>
              {group.themes.map((theme) => (
                <DropdownMenuItem
                  key={theme.id}
                  onSelect={() => setValue(theme.id)}
                  className={theme.id === value ? ITEM_ACTIVE : ITEM_INACTIVE}
                >
                  <TerminalThemeSwatch theme={theme} />
                  {theme.name}
                </DropdownMenuItem>
              ))}
            </Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SettingRow>
  )
})
