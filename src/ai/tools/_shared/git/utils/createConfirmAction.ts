import type { AIConfirmAction, AIConfirmActionItem } from '@/right-panels/AIAssistantPanel/AIAssistantPanel.types'

import type { GitConfirmSeverity } from './gitConfirmSeverity'

export interface CreateConfirmActionInput {
  /** Imperative verb shown in the panel header (e.g. "Reset branch"). */
  action: string
  /** One-line description of what will happen. */
  description: string
  /** Per-target rows (file/branch/stash etc). May be empty. */
  items?: AIConfirmActionItem[]
  /** Body text for the warning region. */
  warning: string
  /** Severity tier — `danger` and `caution` are prefixed inline so
   *  hosts that ignore the field still surface the risk. */
  severity?: GitConfirmSeverity
}

/**
 * Build a uniform `AIConfirmAction` for git write tools. Centralizes
 * severity prefixing so write factories stay focused on the op.
 */
export function createConfirmAction(input: CreateConfirmActionInput): AIConfirmAction {
  const severity: GitConfirmSeverity = input.severity ?? 'caution'
  const prefix =
    severity === 'danger' ? 'DESTRUCTIVE — ' : severity === 'caution' ? 'Caution — ' : ''
  return {
    action: input.action,
    description: input.description,
    items: input.items ?? [],
    warning: `${prefix}${input.warning}`,
  }
}
