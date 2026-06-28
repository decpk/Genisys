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
import { AGENT_MODES, type AgentMode } from '@/components/Chat/components/AgentModeSelector'

const MODE_LABEL_MAP: Record<AgentMode, string> = {
  ask: 'Ask',
  plan: 'Plan',
  agent: 'Agent',
}

export const AiDefaultModeSetting = memo(function AiDefaultModeSetting(): React.JSX.Element {
  const aiDefaultMode = useSettingsStore((s) => s.aiDefaultMode)
  const setAiDefaultMode = useSettingsStore((s) => s.setAiDefaultMode)

  const currentLabel = MODE_LABEL_MAP[aiDefaultMode] ?? 'Ask'

  return (
    <SettingRow
      label="Default AI mode"
      description="The default mode for the AI assistant across all apps. Ask = read-only answers, Plan = planning only, Agent = autonomous actions."
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
          {AGENT_MODES.map((mode) => (
            <DropdownMenuItem
              key={mode.id}
              onSelect={() => setAiDefaultMode(mode.id)}
              className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] cursor-pointer outline-none transition-colors ${
                aiDefaultMode === mode.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground/80 hover:bg-secondary'
              }`}
            >
              <mode.icon size={14} />
              <div className="flex flex-col">
                <span>{mode.label}</span>
                <span className="text-[11px] text-muted-foreground">{mode.description}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SettingRow>
  )
})
