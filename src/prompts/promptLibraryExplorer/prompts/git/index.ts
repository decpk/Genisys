import type { PmPrompt } from '@/store/prompt-manager-store'

import { summarizeGitStatus } from './summarizeGitStatus'
import { mostChangedFiles } from './mostChangedFiles'
import { localUncommittedChanges } from './localUncommittedChanges'
import { whatChangedSinceBase } from './whatChangedSinceBase'
import { commitsByAuthor } from './commitsByAuthor'

export { summarizeGitStatus, mostChangedFiles, localUncommittedChanges, whatChangedSinceBase, commitsByAuthor }

export const GIT_PROMPTS: PmPrompt[] = [
  summarizeGitStatus,
  mostChangedFiles,
  localUncommittedChanges,
  whatChangedSinceBase,
  commitsByAuthor,
]
