import type { TimerMode } from '@/store/timer-store/timer-store.types'

export interface PresetEditorFormState {
  label: string
  mode: TimerMode
  workSec: number
  breakSec: number
  iconKey: string
  tagline: string
  description: string
  bestFor: string[]
  themeId: string
  soundProfileId: string
  autoStartBreak: boolean
}

export type PresetEditorMode = 'create' | 'edit' | 'duplicate'

/**
 * Normalized source shape passed to the dialog when editing or duplicating.
 * Both built-ins and custom presets get mapped to this shape by the
 * caller before opening the dialog.
 */
export interface PresetEditorSource {
  label: string
  mode: TimerMode
  durationSec: number
  breakSec?: number
  iconKey: string
  tagline: string
  description: string
  bestFor: string[]
  themeId?: string
  soundProfileId?: string
  autoStartBreak?: boolean
  /** Required for `mode === 'edit'`; identifies the custom preset to patch. */
  customId?: string
}

export interface PresetEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Determines submit verb and whether `submit()` calls add vs update. */
  mode: PresetEditorMode
  /** Source preset for prefill. Required for `edit` and `duplicate`. */
  source?: PresetEditorSource
}
