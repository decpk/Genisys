import type { PmPrompt } from '@/store/prompt-manager-store'

import { findSymbolUsages } from './findSymbolUsages'
import { findFilesImporting } from './findFilesImporting'
import { findDeadFiles } from './findDeadFiles'
import { topLargestSourceFiles } from './topLargestSourceFiles'
import { todoFixmeDensity } from './todoFixmeDensity'

export { findSymbolUsages, findFilesImporting, findDeadFiles, topLargestSourceFiles, todoFixmeDensity }

export const REFACTOR_PROMPTS: PmPrompt[] = [
  findSymbolUsages,
  findFilesImporting,
  findDeadFiles,
  topLargestSourceFiles,
  todoFixmeDensity,
]
