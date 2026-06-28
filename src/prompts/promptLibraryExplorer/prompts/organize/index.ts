import type { PmPrompt } from '@/store/prompt-manager-store'

import { groupFilesByExtension } from './groupFilesByExtension'
import { sortFilesByDate } from './sortFilesByDate'
import { groupScreenshotsBySource } from './groupScreenshotsBySource'
import { suggestFolderStructure } from './suggestFolderStructure'
import { moveFilesMatchingGlob } from './moveFilesMatchingGlob'
import { sortScreenshotsByDate } from './sortScreenshotsByDate'

export {
  groupFilesByExtension,
  sortFilesByDate,
  groupScreenshotsBySource,
  suggestFolderStructure,
  moveFilesMatchingGlob,
  sortScreenshotsByDate,
}

export const ORGANIZE_PROMPTS: PmPrompt[] = [
  groupFilesByExtension,
  sortFilesByDate,
  groupScreenshotsBySource,
  suggestFolderStructure,
  moveFilesMatchingGlob,
  sortScreenshotsByDate,
]
