import { useCallback, useEffect, useRef, useState } from 'react'

import type {
  AIActionId,
  AIActionOpts,
} from '@/components/Chat/components/AIQuestionBlock'
import {
  DEFAULT_IMPLEMENT_PROMPT,
  DEFAULT_REFINE_PROMPT,
} from '@/components/Chat/components/AIQuestionBlock'

import type { AIConfirmAction, AIStatus } from './AIAssistantPanel.types'

/**
 * Options handed to `useActionResolution` by each AI Assistant surface.
 *
 * The hook owns the bookkeeping (which message had which action resolved,
 * one-shot auto-approval of the next pre-authorized run) and lets each
 * surface plug in its own `sendMessage` + agent-mode switch.
 */
export interface UseActionResolutionOptions {
  /** Surface's own send entry point — gets the follow-up prompt as text. */
  sendMessage: (text: string) => void | Promise<void>
  /** Switch the AI panel into agent (auto-execute) mode for this surface. */
  setAgentMode: () => void
  /** Surface's auto-approve confirmation gate (called when AI surfaces a confirmation during a pre-authorized run). */
  confirmAction: () => void
  /** Current pending-confirm state from the surface so we can auto-fire. */
  pendingConfirm: AIConfirmAction | null
  /** Status from the surface so we can clear the auto-approve flag at end-of-run. */
  status: AIStatus
}

export interface UseActionResolutionReturn {
  /** Set of message IDs whose action buttons have been resolved (drives disabled state). */
  resolvedActionMessageIds: Set<string>
  /** Map of resolved messageId → which action id was clicked. */
  resolvedActionByMessageId: Map<string, AIActionId>
  /** Handler to wire into the panel's `onActionClick`. */
  onActionClick: (messageId: string, actionId: AIActionId, opts: AIActionOpts) => void
}

/**
 * Shared bookkeeping for the AI Action Block ("Implement / Refine / Cancel"
 * buttons). Each AI Assistant Panel surface owns its own state, but the
 * shape is identical: mark a message resolved, optionally fire the
 * surface's send/agent-mode plumbing, and auto-confirm the *next*
 * pre-authorized run when the user picks "Implement".
 */
export function useActionResolution(
  opts: UseActionResolutionOptions,
): UseActionResolutionReturn {
  const { sendMessage, setAgentMode, confirmAction, pendingConfirm, status } = opts

  // Mutable refs let us re-use latest values inside `useEffect` without
  // re-running the auto-approve guard when sendMessage identity changes.
  const sendMessageRef = useRef(sendMessage)
  sendMessageRef.current = sendMessage
  const setAgentModeRef = useRef(setAgentMode)
  setAgentModeRef.current = setAgentMode
  const confirmActionRef = useRef(confirmAction)
  confirmActionRef.current = confirmAction

  const [resolvedActionMessageIds, setResolvedActionMessageIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [resolvedActionByMessageId, setResolvedActionByMessageId] = useState<Map<string, AIActionId>>(
    () => new Map(),
  )

  /** One-shot flag: when true, the *next* `pendingConfirm` is auto-confirmed. */
  const autoApproveNextRunRef = useRef(false)

  const onActionClick = useCallback(
    (messageId: string, actionId: AIActionId, callOpts: AIActionOpts) => {
      // Mark this message's action group as resolved.
      setResolvedActionMessageIds((prev) => {
        if (prev.has(messageId)) return prev
        const next = new Set(prev)
        next.add(messageId)
        return next
      })
      setResolvedActionByMessageId((prev) => {
        const next = new Map(prev)
        next.set(messageId, actionId)
        return next
      })

      if (actionId === 'cancel') return

      if (actionId === 'implement') {
        setAgentModeRef.current()
        autoApproveNextRunRef.current = true
        const prompt = callOpts.prompt ?? DEFAULT_IMPLEMENT_PROMPT
        void sendMessageRef.current(prompt)
        return
      }

      // 'refine'
      const prompt = callOpts.prompt ?? DEFAULT_REFINE_PROMPT
      void sendMessageRef.current(prompt)
    },
    [],
  )

  // Auto-fire confirmAction() exactly once when a pre-authorized run surfaces
  // a confirmation. We only consume the flag if a pendingConfirm appears; if
  // the run finishes without ever asking for confirmation, the flag is
  // cleared when status returns to idle (below).
  useEffect(() => {
    if (!pendingConfirm) return
    if (!autoApproveNextRunRef.current) return
    autoApproveNextRunRef.current = false
    confirmActionRef.current()
  }, [pendingConfirm])

  // Belt-and-suspenders: clear the flag when the run ends (idle reached
  // without ever surfacing a confirmation). Prevents a stale "approve next"
  // flag from leaking into a later, unrelated send.
  useEffect(() => {
    if (status !== 'idle') return
    autoApproveNextRunRef.current = false
  }, [status])

  return {
    resolvedActionMessageIds,
    resolvedActionByMessageId,
    onActionClick,
  }
}
