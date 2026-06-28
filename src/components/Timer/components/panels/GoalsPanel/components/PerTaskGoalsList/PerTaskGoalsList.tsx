import { useState } from 'react'
import { Plus, Hash } from "lucide-react";

import { MinutesStepper } from '@/components/ui/minutes-stepper'
import { PanelInput } from "@/components/ui/panel-input";
import { Tooltip } from '@/components/Tooltip'
import type { TimerPerTaskTarget } from '../../GoalsPanel.types'

import { PerTaskGoalRow } from '../PerTaskGoalRow'
import type { PerTaskGoalsListProps } from './PerTaskGoalsList.types'

export function PerTaskGoalsList(
  props: PerTaskGoalsListProps,
): React.JSX.Element {
  const { targets, onChange } = props
  const [draftId, setDraftId] = useState('')
  const [draftMinutes, setDraftMinutes] = useState(30)

  const handleAdd = () => {
    const taskId = draftId.trim()
    if (!taskId) return
    if (targets.some((t) => t.taskId === taskId)) return
    onChange([...targets, { taskId, minutes: draftMinutes }])
    setDraftId('')
    setDraftMinutes(30)
  }

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  const handleRowChange = (next: TimerPerTaskTarget) => {
    onChange(targets.map((t) => (t.taskId === next.taskId ? next : t)))
  }

  const handleRemove = (taskId: string) => {
    onChange(targets.filter((t) => t.taskId !== taskId))
  }

  let listBody: React.ReactNode = null
  if (targets.length === 0) {
    listBody = (
      <div className="text-[11px] text-muted-foreground italic px-1 py-2">
        No per-task goals yet — add one below.
      </div>
    )
  } else {
    listBody = targets.map((t) => (
      <PerTaskGoalRow
        key={t.taskId}
        target={t}
        onChange={handleRowChange}
        onRemove={handleRemove}
      />
    ))
  }

  const canAdd = draftId.trim().length > 0

  return (
    <section className="px-3 pt-3">
      <div className="rounded-xl border border-border/50 bg-card p-3.5">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Per-task goals
        </div>
        <div className="mt-2 flex flex-col">{listBody}</div>

        <div className="mt-3 pt-3 border-t border-border/40">
          <div className="text-[10px] font-medium text-muted-foreground mb-2">
            Add new goal
          </div>
          <div className="flex items-center gap-2">
            <PanelInput
              value={draftId}
              onChange={(e) => setDraftId(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Task id"
              leadingIcon={<Hash size={12} />}
              className="flex-1"
            />
            <MinutesStepper
              value={draftMinutes}
              onChange={setDraftMinutes}
              min={0}
              max={1440}
              step={5}
              suffix="m"
              ariaLabel="Target minutes"
            />
            <Tooltip content="Add goal" side="top">
              <button
                type="button"
                onClick={handleAdd}
                disabled={!canAdd}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={14} />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </section>
  );
}
