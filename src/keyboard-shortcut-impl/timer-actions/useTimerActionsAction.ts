import { useBindShortcutActions } from '@/frameworks/keyboard-shortcut'
import { useTimerStore } from '@/store/timer-store'

function getPrimaryId(): string | null {
  return useTimerStore.getState().primaryId
}

function startPause(): void {
  const state = useTimerStore.getState()
  const id = state.primaryId
  if (!id) return
  const instance = state.instances.find((i) => i.id === id)
  if (!instance) return
  if (instance.isRunning) state.pauseTimer(id)
  else state.startTimer(id)
}

function reset(): void {
  const id = getPrimaryId()
  if (!id) return
  useTimerStore.getState().resetTimer(id)
}

function skip(): void {
  const id = getPrimaryId()
  if (!id) return
  useTimerStore.getState().skipPhase(id)
}

function newTimer(): void {
  useTimerStore.getState().openNewTimerDialog()
}

export function useTimerActionsAction(): void {
  useBindShortcutActions({
    'timer.startPause': startPause,
    'timer.reset': reset,
    'timer.skip': skip,
    'timer.newTimer': newTimer,
  })
}
