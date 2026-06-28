/**
 * The canonical list of Explorer sidebar shortcut keys.
 *
 * Used by:
 * - `app-data.ts` — `settings.explorer.shortcutVisibility` shape
 * - `settings-store.ts` — `explorerShortcutVisibility` field + setter
 * - `ExplorerShortcuts` component — render order / visibility filter
 * - `ExplorerShortcutsSetting` — toggle UI rows
 *
 * The order in this array IS the display order in the sidebar.
 */
export const EXPLORER_SHORTCUT_KEYS = [
  "home",
  "desktop",
  "downloads",
  "documents",
  "applications",
  "pictures",
] as const;

export type ExplorerShortcutKey = (typeof EXPLORER_SHORTCUT_KEYS)[number];

export type ExplorerShortcutVisibility = Record<ExplorerShortcutKey, boolean>;

/** Defaults — every shortcut visible. Applications still auto-hides on
 *  non-macOS at the resolver level (its path is `null` from the backend). */
export const EXPLORER_SHORTCUT_VISIBILITY_DEFAULTS: ExplorerShortcutVisibility =
  {
    home: true,
    desktop: true,
    downloads: true,
    documents: true,
    applications: true,
    pictures: true,
  };
