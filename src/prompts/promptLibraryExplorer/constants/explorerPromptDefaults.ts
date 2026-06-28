/**
 * Shared, in-code defaults for every built-in prompt that belongs to the
 * Explorer Library. Centralizing these here keeps the folder / category /
 * prompt files declaration-only — they never have to hand-roll timestamps,
 * folder IDs, or the folder color.
 */

/**
 * Stable ISO timestamp baked into every built-in record. Built-ins are
 * declared in code (not user-generated), so using a constant rather than
 * `new Date().toISOString()` keeps store snapshots reproducible across
 * loads and prevents spurious `updatedAt` churn in the persistence layer.
 */
export const EXPLORER_NOW = '2026-05-29T00:00:00.000Z'

/**
 * Stable ID for the Explorer Library folder. Referenced by every category
 * and prompt file in this directory tree (via the EXPLORER_FOLDER constant)
 * and persisted to the prompt-manager DB.
 */
export const EXPLORER_FOLDER_ID = 'f-exp-builtin-0001'

/**
 * Folder display color. Sky-500 — visually distinct from the existing
 * Developer Library (blue-500 `#3b82f6`) and Teacher-Student Library
 * (violet-500 `#8b5cf6`) folders.
 */
export const EXPLORER_FOLDER_COLOR = '#0ea5e9'

/**
 * Folder sort order. Negative so it groups above any user-created folder
 * (which start at sortOrder = folders.length, i.e. >= 0). Chosen as -3 so
 * the three built-in libraries (Developer = -1, Teacher = -2, Explorer = -3)
 * stack in a stable, distinguishable order at the top of the folder list.
 */
export const EXPLORER_FOLDER_SORT_ORDER = -3

/**
 * Human-readable folder name shown in the Explorer AI panel's prompt
 * picker and in the prompt-manager UI.
 */
export const EXPLORER_FOLDER_NAME = 'Explorer Library'

/**
 * App-scope tag(s) for the Explorer Library folder. The PromptPicker uses
 * `getFoldersForApp()` to filter folders against the current `appId`; with
 * `['explorer']` the folder only surfaces inside the Project Explorer's AI
 * panel and is hidden from every other prompt picker.
 */
export const EXPLORER_FOLDER_SCOPES: ReadonlyArray<'explorer'> = ['explorer']
