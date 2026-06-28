import type { PmFolder } from '@/store/prompt-manager-store'

import {
  EXPLORER_FOLDER_COLOR,
  EXPLORER_FOLDER_ID,
  EXPLORER_FOLDER_NAME,
  EXPLORER_FOLDER_SCOPES,
  EXPLORER_FOLDER_SORT_ORDER,
  EXPLORER_NOW,
} from './constants/explorerPromptDefaults'

/**
 * Built-in folder that owns every Explorer-scoped prompt shipped with the
 * app. Marked `isBuiltIn` so the prompt-manager store refuses destructive
 * edits (name / color changes are blocked; users may only tweak `scopes`).
 *
 * Surface: rendered by the PromptPicker only when `appId === 'explorer'`.
 */
export const EXPLORER_FOLDER: PmFolder = {
  id: EXPLORER_FOLDER_ID,
  name: EXPLORER_FOLDER_NAME,
  color: EXPLORER_FOLDER_COLOR,
  scopes: [...EXPLORER_FOLDER_SCOPES],
  sortOrder: EXPLORER_FOLDER_SORT_ORDER,
  createdAt: EXPLORER_NOW,
  updatedAt: EXPLORER_NOW,
  isBuiltIn: true,
}
