import type { SettingsSection } from '@/components/Settings/Settings.types'

/**
 * Position of the floating Settings window, in CSS pixels from the
 * top-left of the viewport. `null` means "open centered on next mount"
 * — used until the user moves the window for the first time.
 */
export interface WindowPosition {
  x: number
  y: number
}

export interface WindowSize {
  width: number
  height: number
}

export interface SettingsDrawerState {
  /** Window open/close state. Always starts `false` on app launch. */
  isOpen: boolean
  /** Persisted position. `null` = center on next open. */
  position: WindowPosition | null
  /** Persisted size. */
  size: WindowSize
  /** Hydrated from `app-data.json`. UI should wait for this before reading. */
  isLoaded: boolean
  /**
   * The currently selected Settings section. Shared between the floating
   * window and the full Settings app so that "Open full" carries over the
   * section the user was viewing. Not persisted.
   */
  activeSection: SettingsSection
}

export interface SettingsDrawerActions {
  open: () => void
  close: () => void
  toggle: () => void
  setPosition: (position: WindowPosition) => void
  setSize: (size: WindowSize) => void
  /** Select a Settings section, shared across the floating + full views. */
  setActiveSection: (section: SettingsSection) => void
  /**
   * Hydrate from persisted `app-data.json`. Called once during app init.
   * Idempotent — safe to call multiple times.
   */
  initDrawer: () => Promise<void>
}

export type SettingsDrawerStore = SettingsDrawerState & SettingsDrawerActions
