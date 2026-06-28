import type { PmPrompt } from '@/store/prompt-manager-store'

import { diskUsageBreakdown } from './diskUsageBreakdown'
import { topLargestFiles } from './topLargestFiles'
import { fileCountByExtension } from './fileCountByExtension'
import { folderStructureTree } from './folderStructureTree'
import { recentModifiedFiles } from './recentModifiedFiles'

export { diskUsageBreakdown, topLargestFiles, fileCountByExtension, folderStructureTree, recentModifiedFiles }

export const AUDIT_PROMPTS: PmPrompt[] = [
  diskUsageBreakdown,
  topLargestFiles,
  fileCountByExtension,
  folderStructureTree,
  recentModifiedFiles,
]
