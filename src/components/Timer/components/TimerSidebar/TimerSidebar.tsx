import { useState } from 'react'
import { Plus, Timer as TimerIcon } from 'lucide-react'

import { useTimerStore } from '@/store/timer-store'

import { NewTimerDialog } from '../NewTimerDialog'
import type { TimerPreset } from '../../constants/timerPresets'

import { ActiveTimersSection } from './components/ActiveTimersSection'
import { PresetsSection } from './components/PresetsSection'
import { TagsSection } from './components/TagsSection'
import { useTimerSidebarData } from './useTimerSidebarData'

export function TimerSidebar(): React.JSX.Element {
  const {
    instances,
    tags,
    primaryId,
    setPrimary,
    removeInstance,
    newTimerOpen,
    openNewTimerDialog,
    setNewTimerOpen,
  } = useTimerSidebarData()
  const createInstance = useTimerStore((s) => s.createInstance)
  const [activeTagId, setActiveTagId] = useState<string | null>(null)

  const runningCount = instances.filter((i) => i.isRunning).length
  const totalCount = instances.length

  let statusLine: string
  if (totalCount === 0) statusLine = 'No timers yet'
  else if (runningCount > 0) statusLine = `${runningCount} running \u00B7 ${totalCount} total`
  else statusLine = `${totalCount} paused`

  const handlePreset = (preset: TimerPreset) => {
    const customPreset = useTimerStore
      .getState()
      .customPresets.find((p) => p.id === preset.id)
    const newId = createInstance({
      name: preset.label,
      mode: preset.mode,
      durationSec: preset.durationSec,
      themeId: customPreset?.themeId,
      soundProfileId: customPreset?.soundProfileId,
      autoStartBreak: customPreset?.autoStartBreak,
    })
    if (newId) setPrimary(newId)
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="px-3.5 pt-4 pb-3 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 text-primary">
            <TimerIcon size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-foreground leading-tight">Timer</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
              {runningCount > 0 && (
                <span className="inline-flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </span>
              )}
              <span>{statusLine}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openNewTimerDialog}
          className="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>New Timer</span>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto">
        <ActiveTimersSection
          instances={instances}
          primaryId={primaryId}
          onSelect={setPrimary}
          onRemove={removeInstance}
        />
        <TagsSection tags={tags} activeTagId={activeTagId} onSelect={setActiveTagId} />
        <PresetsSection onPresetSelect={handlePreset} />
      </div>
      <NewTimerDialog open={newTimerOpen} onOpenChange={setNewTimerOpen} />
    </div>
  )
}
