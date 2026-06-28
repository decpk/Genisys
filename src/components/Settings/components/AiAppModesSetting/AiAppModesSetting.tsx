import { memo, useCallback } from 'react'
import { ChevronDown } from 'lucide-react'
import { useSettingsStore } from '@/store/settings-store'
import { SettingRow } from '../SettingRow'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { AGENT_MODES, type AgentMode } from '@/components/Chat/components/AgentModeSelector'

const APP_ENTRIES: { id: string; label: string; description: string }[] = [
  { id: 'chat', label: 'Chat', description: 'Main AI Chat app' },
  { id: 'explorer', label: 'Explorer', description: 'Explorer AI assistant (maps to Auto/Safe/Manual)' },
  { id: 'notes', label: 'Notes', description: 'Notes AI assistant' },
  { id: 'dailyplan', label: 'Daily Plan', description: 'Daily Plan AI assistant' },
  { id: 'library', label: 'Library', description: 'Library AI assistant' },
  { id: 'apiclient', label: 'API Client', description: 'API Client AI assistant' },
]

const MODE_LABEL_MAP: Record<AgentMode, string> = {
  ask: 'Ask',
  plan: 'Plan',
  agent: 'Agent',
}

export const AiAppModesSetting = memo(function AiAppModesSetting(): React.JSX.Element {
  const aiDefaultMode = useSettingsStore((s) => s.aiDefaultMode)
  const aiAppModes = useSettingsStore((s) => s.aiAppModes)
  const setAiAppMode = useSettingsStore((s) => s.setAiAppMode)

  return (
    <SettingRow
      label="Per-app AI mode overrides"
      description="Override the default AI mode for individual apps. Apps without an override will use the default mode."
    >
      <div className="flex flex-col gap-2 min-w-[240px]">
        {APP_ENTRIES.map((app) => (
          <AppModeRow
            key={app.id}
            appId={app.id}
            appLabel={app.label}
            currentMode={aiAppModes[app.id]}
            defaultMode={aiDefaultMode}
            onModeChange={setAiAppMode}
          />
        ))}
      </div>
    </SettingRow>
  )
})

interface AppModeRowProps {
  appId: string
  appLabel: string
  currentMode: AgentMode | undefined
  defaultMode: AgentMode
  onModeChange: (appId: string, mode: AgentMode | undefined) => void
}

const AppModeRow = memo(function AppModeRow(props: AppModeRowProps): React.JSX.Element {
  const { appId, appLabel, currentMode, defaultMode, onModeChange } = props

  const effectiveMode = currentMode ?? defaultMode
  const isDefault = currentMode === undefined

  const handleSelect = useCallback(
    (mode: AgentMode | undefined) => {
      onModeChange(appId, mode)
    },
    [appId, onModeChange],
  )

  const buttonLabel = isDefault
    ? `${MODE_LABEL_MAP[effectiveMode]} (default)`
    : MODE_LABEL_MAP[effectiveMode]

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] text-foreground/80">{appLabel}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors cursor-pointer border ${
              isDefault
                ? 'bg-secondary/40 text-muted-foreground border-border/30'
                : 'bg-secondary/60 text-foreground border-border/40'
            } hover:bg-secondary`}
          >
            <span>{buttonLabel}</span>
            <ChevronDown size={10} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={4}
          className="z-50 min-w-[150px] rounded-lg border border-border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95"
        >
          <DropdownMenuItem
            onSelect={() => handleSelect(undefined)}
            className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] cursor-pointer outline-none transition-colors ${
              isDefault
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-foreground/80 hover:bg-secondary'
            }`}
          >
            Use default ({MODE_LABEL_MAP[defaultMode]})
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {AGENT_MODES.map((mode) => (
            <DropdownMenuItem
              key={mode.id}
              onSelect={() => handleSelect(mode.id)}
              className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] cursor-pointer outline-none transition-colors ${
                !isDefault && currentMode === mode.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground/80 hover:bg-secondary'
              }`}
            >
              <mode.icon size={12} />
              {mode.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
})
