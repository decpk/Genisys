import type { PmPrompt } from '@/store/prompt-manager-store'

import { AUDIT_PROMPTS } from './audit'
import { DUPLICATES_PROMPTS } from './duplicates'
import { GIT_PROMPTS } from './git'
import { HYGIENE_PROMPTS } from './hygiene'
import { ORGANIZE_PROMPTS } from './organize'
import { REFACTOR_PROMPTS } from './refactor'
import { RENAME_PROMPTS } from './rename'
import { SECURITY_PROMPTS } from './security'

export {
  AUDIT_PROMPTS,
  DUPLICATES_PROMPTS,
  GIT_PROMPTS,
  HYGIENE_PROMPTS,
  ORGANIZE_PROMPTS,
  REFACTOR_PROMPTS,
  RENAME_PROMPTS,
  SECURITY_PROMPTS,
}

/**
 * Consolidated list of every built-in Explorer Library prompt, ordered by
 * category sortOrder, then by prompt sortOrder within the category. Consumed
 * by the prompt-manager store as part of `ALL_BUILTIN_PROMPTS`.
 */
export const EXPLORER_PROMPTS: PmPrompt[] = [
  ...ORGANIZE_PROMPTS,
  ...DUPLICATES_PROMPTS,
  ...RENAME_PROMPTS,
  ...AUDIT_PROMPTS,
  ...HYGIENE_PROMPTS,
  ...SECURITY_PROMPTS,
  ...GIT_PROMPTS,
  ...REFACTOR_PROMPTS,
]
