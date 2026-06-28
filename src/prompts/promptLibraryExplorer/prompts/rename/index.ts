import type { PmPrompt } from '@/store/prompt-manager-store'

import { renameToKebabCase } from './renameToKebabCase'
import { renameToSnakeCase } from './renameToSnakeCase'
import { stripCopyOfSuffix } from './stripCopyOfSuffix'
import { addDatePrefix } from './addDatePrefix'
import { lowercaseAndDash } from './lowercaseAndDash'

export { renameToKebabCase, renameToSnakeCase, stripCopyOfSuffix, addDatePrefix, lowercaseAndDash }

export const RENAME_PROMPTS: PmPrompt[] = [
  renameToKebabCase,
  renameToSnakeCase,
  stripCopyOfSuffix,
  addDatePrefix,
  lowercaseAndDash,
]
