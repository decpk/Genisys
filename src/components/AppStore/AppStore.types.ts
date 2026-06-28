import type { LucideIcon } from 'lucide-react'

import type { AppView } from '@/components/ActivityBar'

/**
 * High-level category an app is filed under in the App Store sidebar
 * and "Discover" rail. Categories are intentionally small in number to
 * keep the store browsable, not exhaustive.
 */
export type AppCategoryId =
  | 'productivity'
  | 'development'
  | 'ai'
  | 'system'

export interface AppCategory {
  id: AppCategoryId
  label: string
  tagline: string
  /** Icon shown next to the category in the sidebar, tiles, and headers. */
  icon: LucideIcon
  /** Accent color (hex) used to tint the category's icon and tiles. */
  accentColor: string
}

/**
 * One "feature bullet" rendered in the app detail page. Kept short so
 * the layout matches the App Store style (icon + 1-line headline + 1
 * sentence description).
 */
export interface AppFeature {
  icon: LucideIcon
  title: string
  description: string
}

/**
 * Lifecycle status for a catalog entry (see {@link AppCatalogEntry.status}).
 */
export type AppStatus = 'archived' | 'in-development'

/**
 * Catalog entry for a single Genisys app. Drives:
 *  - the App Store browse + detail UI
 *  - the "Get / Remove / Open" CTAs (via `enabledApps` + the app's `id`)
 *  - the App Switcher HUD subtitle (via `tagline`)
 *
 * `id` MUST be a real `AppView` so the App Store's install/uninstall
 * actions can map back to `enabledApps` and the ActivityBar.
 */
export interface AppCatalogEntry {
  id: AppView
  name: string
  tagline: string
  description: string
  category: AppCategoryId
  icon: LucideIcon
  accentColor: string
  features: AppFeature[]
  whatsNew?: string[]
  version: string
  featured?: boolean
  /** When true, the App Store hides the Remove button (always-enabled). */
  locked?: boolean
  /**
   * Lifecycle status badge shown in the App Store. Absent = a normal,
   * active app.
   * - `archived`: superseded/legacy. Pulled out of its category into a
   *   dedicated "Archived" section, but still installable.
   * - `in-development`: work in progress. Shown with an "In development"
   *   badge and a disabled "Coming soon" action (cannot be enabled yet).
   */
  status?: AppStatus
}
