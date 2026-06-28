import type { ReactNode } from 'react'

import type { PmPrompt } from '@/store/prompt-manager-store'
import type { PromptScopeApp } from '@/lib/prompt-scope'

export interface PromptPickerProps {
  /** The AppView this picker is mounted in. Used to filter scoped folders. */
  appId: PromptScopeApp
  /** Called when the user selects a prompt. The handler receives the prompt
   * stripped of any `{{template}}` placeholders so it can be inserted at
   * the editor's cursor. */
  onSelect: (prompt: PmPrompt) => void
  /** Optional custom trigger element. Defaults to the Sparkles icon button. */
  trigger?: ReactNode
  /** Popover side relative to trigger. Defaults to `top`. */
  side?: 'top' | 'bottom' | 'left' | 'right'
  /** Popover alignment relative to trigger. Defaults to `start`. */
  align?: 'start' | 'center' | 'end'
  /** Controlled open state. When provided, the picker becomes controlled and
   * its internal open state is ignored (pair with `onOpenChange`). */
  open?: boolean
  /** Notified when the picker requests an open-state change (controlled mode). */
  onOpenChange?: (open: boolean) => void
}
