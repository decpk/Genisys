import type { PmCategory } from '@/store/prompt-manager-store'

import { auditAndInventory } from './auditAndInventory'
import { bulkRenameAndNormalize } from './bulkRenameAndNormalize'
import { duplicatesAndCleanup } from './duplicatesAndCleanup'
import { gitInsights } from './gitInsights'
import { organizeAndCategorize } from './organizeAndCategorize'
import { projectHygiene } from './projectHygiene'
import { refactorAndDiscovery } from './refactorAndDiscovery'
import { securityAndSecrets } from './securityAndSecrets'

export {
  auditAndInventory,
  bulkRenameAndNormalize,
  duplicatesAndCleanup,
  gitInsights,
  organizeAndCategorize,
  projectHygiene,
  refactorAndDiscovery,
  securityAndSecrets,
}

/**
 * Consolidated list of every built-in category in the Explorer Library,
 * ordered by their declared `sortOrder` (which matches their display order
 * in the prompt picker). Consumed by the prompt-manager store as part of
 * `ALL_BUILTIN_CATEGORIES`.
 */
export const EXPLORER_CATEGORIES: PmCategory[] = [
  organizeAndCategorize,
  duplicatesAndCleanup,
  bulkRenameAndNormalize,
  auditAndInventory,
  projectHygiene,
  securityAndSecrets,
  gitInsights,
  refactorAndDiscovery,
]
