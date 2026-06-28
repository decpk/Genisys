import { useEffect } from 'react'

import { useBindShortcutActions } from '@/frameworks/keyboard-shortcut'
import { IS_MAC } from '@/frameworks/keyboard-shortcut/KeyboardShortcut.constants'
import { parseKeyChord } from '@/frameworks/keyboard-shortcut/utils/parseKeyChord'
import { resolveShortcuts } from '@/frameworks/keyboard-shortcut/utils/resolveShortcuts'
import type { KeyCombo } from '@/frameworks/keyboard-shortcut/KeyboardShortcut.types'
import { useFullscreenClockStore } from '@/store/fullscreen-clock-store'
import { useSettingsStore } from '@/store/settings-store'

const SHORTCUT_ID = 'clock.showFullscreen'

const KEY_MAP: Record<string, string> = {
  up: 'arrowup',
  down: 'arrowdown',
  left: 'arrowleft',
  right: 'arrowright',
  enter: 'enter',
  escape: 'escape',
  backspace: 'backspace',
  delete: 'delete',
  tab: 'tab',
  space: ' ',
}

function getResolvedCombo(): KeyCombo | null {
  const shortcut = resolveShortcuts().find((s) => s.id === SHORTCUT_ID)
  if (!shortcut || shortcut.isDisabled) return null
  const chord = parseKeyChord(shortcut.keys)
  if (chord.length !== 1) return null
  return chord[0]
}

function isReleasedComboKey(event: KeyboardEvent, combo: KeyCombo): boolean {
  const released = event.key.toLowerCase()
  // Modifier-key releases
  if (combo.mod) {
    if (IS_MAC && (released === 'meta' || released === 'os')) return true
    if (!IS_MAC && released === 'control') return true
  }
  if (combo.ctrl && released === 'control') return true
  if (combo.alt && released === 'alt') return true
  if (combo.shift && released === 'shift') return true
  // Main key release
  const expectedKey = KEY_MAP[combo.key] ?? combo.key
  if (released === expectedKey) return true
  return false
}

function handleShortcut(): void {
  const pressAndHold = useSettingsStore.getState().fullscreenClockPressAndHold
  const store = useFullscreenClockStore.getState()
  if (pressAndHold) {
    // Key-repeat protection: if already showing in hold mode, ignore.
    if (store.isOpen && store.isHolding) return
    store.show()
    store.setHolding(true)
    return
  }
  store.toggle()
}

export function useClockActionsAction(): void {
  useBindShortcutActions({
    [SHORTCUT_ID]: handleShortcut,
  })

  const pressAndHold = useSettingsStore((s) => s.fullscreenClockPressAndHold)
  const isOpen = useFullscreenClockStore((s) => s.isOpen)
  const isHolding = useFullscreenClockStore((s) => s.isHolding)

  useEffect(() => {
    if (!pressAndHold || !isOpen || !isHolding) return

    function onKeyUp(event: KeyboardEvent): void {
      const combo = getResolvedCombo()
      if (!combo) return
      if (!isReleasedComboKey(event, combo)) return
      const store = useFullscreenClockStore.getState()
      store.setHolding(false)
      store.hide()
    }

    window.addEventListener('keyup', onKeyUp, true)
    return () => window.removeEventListener('keyup', onKeyUp, true)
  }, [pressAndHold, isOpen, isHolding])
}
