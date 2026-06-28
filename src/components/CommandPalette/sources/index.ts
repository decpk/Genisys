import { apiClientSource } from './apiClientSource'
import { appsSource } from './appsSource'
import { bookmarksSource } from './bookmarksSource'
import { chatCommandsSource } from './chatCommandsSource'
import { chatSource } from './chatSource'
import { clipboardSource } from './clipboardSource'
import { createCommandsSource } from './createCommandsSource'
import { dailyPlanSource } from './dailyPlanSource'
import { librarySource } from './librarySource'
import { mockServerSource } from './mockServerSource'
import { notesSource } from './notesSource'
import { shortcutsSource } from './shortcutsSource'
import { switchAppCommandsSource } from './switchAppCommandsSource'
import { themesSource } from './themesSource'
import { toggleCommandsSource } from './toggleCommandsSource'
import type { PaletteSource } from '../CommandPalette.types'

const ALL_SOURCES: PaletteSource[] = [
  // Quick Open
  appsSource,
  notesSource,
  librarySource,
  dailyPlanSource,
  apiClientSource,
  mockServerSource,
  chatSource,
  bookmarksSource,
  clipboardSource,
  // Commands
  shortcutsSource,
  switchAppCommandsSource,
  createCommandsSource,
  themesSource,
  toggleCommandsSource,
  chatCommandsSource,
]

export function getAllSources(): PaletteSource[] {
  return ALL_SOURCES
}
