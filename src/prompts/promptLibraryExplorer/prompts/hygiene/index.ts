import type { PmPrompt } from '@/store/prompt-manager-store'

import { checkMissingFiles } from './checkMissingFiles'
import { auditGitignore } from './auditGitignore'
import { findTodoComments } from './findTodoComments'
import { findDuplicateBasenames } from './findDuplicateBasenames'
import { listPackageScripts } from './listPackageScripts'

export { checkMissingFiles, auditGitignore, findTodoComments, findDuplicateBasenames, listPackageScripts }

export const HYGIENE_PROMPTS: PmPrompt[] = [
  checkMissingFiles,
  auditGitignore,
  findTodoComments,
  findDuplicateBasenames,
  listPackageScripts,
]
