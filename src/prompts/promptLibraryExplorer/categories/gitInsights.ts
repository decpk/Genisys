import type { PmCategory } from '@/store/prompt-manager-store'

import { EXPLORER_FOLDER } from '../EXPLORER_FOLDER'
import { EXPLORER_NOW } from '../constants/explorerPromptDefaults'

/**
 * Category 7 — git-aware summaries built on top of the Explorer AI's
 * `git_status`, `git_log`, `git_diff`, and related tools: plain-English
 * status, hottest files, local uncommitted changes, diff-since-base,
 * commits-grouped-by-author.
 */
export const gitInsights: PmCategory = {
  id: 'c-exp-builtin-0007',
  folderId: EXPLORER_FOLDER.id,
  name: 'Git Insights',
  icon: '',
  sortOrder: 6,
  createdAt: EXPLORER_NOW,
  updatedAt: EXPLORER_NOW,
  isBuiltIn: true,
}
