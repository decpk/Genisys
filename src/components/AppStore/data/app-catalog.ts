import type { AppView } from '@/components/ActivityBar'

import type { AppCatalogEntry, AppCategoryId } from '../AppStore.types'

import { apiclientApp } from './apps/apiclientApp'
import { appstoreApp } from './apps/appstoreApp'
import { autoflowApp } from './apps/autoflowApp'
import { webpointApp } from './apps/webpointApp'
import { chatApp } from './apps/chatApp'
import { clipboardApp } from './apps/clipboardApp'
import { dailyplanApp } from './apps/dailyplanApp'
import { dashboardApp } from './apps/dashboardApp'
import { explorerApp } from './apps/explorerApp'
import { libraryApp } from './apps/libraryApp'
import { messagesApp } from './apps/messagesApp'
import { mockserverApp } from './apps/mockserverApp'
import { notesApp } from './apps/notesApp'
import { weblinksApp } from './apps/weblinksApp'
import { promptsApp } from './apps/promptsApp'
import { quickshareApp } from './apps/quickshareApp'
import { monitorApp } from './apps/monitorApp'
import { terminalApp } from './apps/terminalApp'
import { timerApp } from './apps/timerApp'

/**
 * Master catalog of every app the App Store knows about. Order here
 * controls the order in browse views unless a more specific sort is
 * applied (e.g. featured first).
 */
export const APP_CATALOG: ReadonlyArray<AppCatalogEntry> = [
  dashboardApp,
  dailyplanApp,
  notesApp,
  promptsApp,
  libraryApp,
  explorerApp,
  terminalApp,
  monitorApp,
  quickshareApp,
  chatApp,
  messagesApp,
  apiclientApp,
  mockserverApp,
  weblinksApp,
  clipboardApp,
  timerApp,
  autoflowApp,
  webpointApp,
  appstoreApp,
]

export function findAppEntry(id: AppView): AppCatalogEntry | undefined {
  return APP_CATALOG.find((entry) => entry.id === id)
}

export function getAppsByCategory(
  categoryId: AppCategoryId,
): AppCatalogEntry[] {
  // Archived apps are pulled out of their category into a dedicated
  // "Archived" section; in-development apps stay in their category.
  return APP_CATALOG.filter(
    (entry) => entry.category === categoryId && entry.status !== 'archived',
  )
}

export function getFeaturedApps(): AppCatalogEntry[] {
  // Never feature an app that carries a lifecycle status (archived / in-dev).
  return APP_CATALOG.filter((entry) => entry.featured && !entry.status)
}

export function getArchivedApps(): AppCatalogEntry[] {
  return APP_CATALOG.filter((entry) => entry.status === 'archived')
}

/** Number of (non-archived) apps filed under a category. */
export function getCategoryCount(categoryId: AppCategoryId): number {
  return getAppsByCategory(categoryId).length
}

/** Total number of browsable apps, including archived. */
export function getTotalAppCount(): number {
  return APP_CATALOG.length
}
