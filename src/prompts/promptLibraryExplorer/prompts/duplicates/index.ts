import type { PmPrompt } from '@/store/prompt-manager-store'

import { findIdenticalFilenames } from './findIdenticalFilenames'
import { findCopyOfDuplicates } from './findCopyOfDuplicates'
import { findEmptyFilesAndFolders } from './findEmptyFilesAndFolders'
import { findOSJunk } from './findOSJunk'
import { findLargeFiles } from './findLargeFiles'
import { findStaleFiles } from './findStaleFiles'

export { findIdenticalFilenames, findCopyOfDuplicates, findEmptyFilesAndFolders, findOSJunk, findLargeFiles, findStaleFiles }

export const DUPLICATES_PROMPTS: PmPrompt[] = [
  findIdenticalFilenames,
  findCopyOfDuplicates,
  findEmptyFilesAndFolders,
  findOSJunk,
  findLargeFiles,
  findStaleFiles,
]
