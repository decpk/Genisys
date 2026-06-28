import type { AgentMode } from '@/components/Chat/components/AgentModeSelector'
import {
  ASK_MODE_SYSTEM_PROMPT,
  PLAN_MODE_SYSTEM_PROMPT,
} from '@/components/Chat/components/AgentModeSelector'
import { AI_QUESTIONS_INSTRUCTION } from '@/components/Chat/components/AIQuestionBlock'
import { composeCoreSystemPrompt } from '@/prompts'
import { buildAutoContextBlock } from '@/lib/ai-context'
import { AI_PLAN_INSTRUCTION } from '@/lib/chat-ui'

/**
 * Compose the final system prompt sent to the LLM for any right-panel
 * AI Assistant surface (Code, Library, Notes, DailyPlan, APIClient,
 * Clipboard, …).
 *
 * Order (top → bottom):
 *   1. Mode prompt (ASK / PLAN) — strongest constraints first.
 *   2. Core fragments — identity, instructions, security, safety,
 *      implementation discipline, tool use, communication style,
 *      parallelization. Shared across all surfaces.
 *   3. Per-surface base prompt (passed in by the calling hook —
 *      contains domain knowledge & tool catalog).
 *   4. AI-questions instruction — interactive question protocol.
 *   5. Plan-progress instruction — `ai-plan` fence + step markers so
 *      multi-step work (e.g. smart-commit) renders as a live "Todos"
 *      card instead of a run-on prose paragraph.
 *
 * All five blocks are additive; flipping a fragment in
 * `coreSystemPrompt.ts` updates every surface in lock-step.
 */
export function buildModeAwareSystemPrompt(basePrompt: string, mode: AgentMode): string {
  const core = composeCoreSystemPrompt()
  const autoContext = buildAutoContextBlock()
  const body = `${core}\n\n${basePrompt}\n${AI_QUESTIONS_INSTRUCTION}\n${AI_PLAN_INSTRUCTION}\n${autoContext}`
  if (mode === 'ask') return `${ASK_MODE_SYSTEM_PROMPT}${body}`
  if (mode === 'plan') return `${PLAN_MODE_SYSTEM_PROMPT}${body}`
  return body
}
