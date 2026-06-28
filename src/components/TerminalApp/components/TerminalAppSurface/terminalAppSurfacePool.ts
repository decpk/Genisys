import { FitAddon } from '@xterm/addon-fit'
import { SerializeAddon } from '@xterm/addon-serialize'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { Terminal as XTerm } from '@xterm/xterm'
import type { IDisposable } from '@xterm/xterm'
import { readText, writeText } from '@tauri-apps/plugin-clipboard-manager'

import { terminalResize } from '@/components/Terminal/api/terminalResize'
import { terminalWrite } from '@/components/Terminal/api/terminalWrite'
import { encodeBase64 } from '@/components/Terminal/utils/encodeBase64'
import { getXtermThemeColors } from '@/components/Terminal/utils/getXtermThemeColors'
import { mapTerminalFontWeight } from '@/components/Terminal/utils/mapTerminalFontWeight'
import { resolveTerminalFontFamily } from '@/components/Terminal/utils/resolveTerminalFontFamily'
import { terminalOutputBus } from '@/components/Terminal/utils/terminalOutputBus'
import { useSettingsStore } from '@/store/settings-store'
import { useTerminalAppStore } from '@/store/terminal-app-store'
import { findLeafByTabId } from '@/store/terminal-app-store/treeUtils'
import type { TermNode, TermTab } from '@/store/terminal-app-store/types'
import { useThemeStore } from '@/store/theme-store'

import { findTerminalThemeById, toXtermTheme } from '../../terminalThemes'
import {
  acceptGhost,
  acceptSelected,
  closeDropdown,
  dropSuggestion,
  getSuggestion,
  moveSelection,
  openDropdown,
} from '../../utils/terminalAutocompleteEngine'
import { dropTerminalLine, feedTerminalLine } from '../../utils/terminalLineTracker'
import { takePendingReplay } from '../../utils/terminalSessionStore'

const IS_MAC =
  typeof navigator !== 'undefined' && /mac/i.test(navigator.platform || '')

interface PooledSurface {
  term: XTerm
  fit: FitAddon
  serialize: SerializeAddon
  element: HTMLDivElement
  unsubOutput: () => void
  unsubExit: () => void
  disposables: IDisposable[]
  resizeObserver: ResizeObserver
}

/**
 * Module-level pool of live xterm instances keyed by PTY session id.
 *
 * The standalone Terminal app uses a recursive split-tree whose React structure
 * changes on split/collapse — which would unmount-and-remount a naive surface
 * and destroy its scrollback. Keeping instances here (detach on unmount,
 * reattach on mount, dispose only when the session is truly gone) preserves
 * each terminal's buffer + I/O across layout changes, and keeps PTY byte
 * streams off the React render path for performance.
 */
const pool = new Map<string, PooledSurface>()

// When true, the per-surface ResizeObserver skips its fit + PTY-resize. Set
// while a neighbouring panel (e.g. the git changes panel) is drag-resized so the
// terminal doesn't reflow scrollback + push a PTY resize on every frame; on
// release the panel re-fits every live surface once.
let resizeSuppressed = false

// ── Remote mirror size control (min-size negotiation) ─────────────────────
// While a remote mirror client is attached to a shared tab, the shared PTY is
// sized to the MIN of the phone's viewport and the desktop's own container
// capacity (tmux-style "smallest attached client wins"). That guarantees BOTH
// ends can display the whole screen — the smaller end fits exactly, the larger
// end letterboxes (blank margin) — and, because the PTY width never exceeds
// either viewer, in-place `\r` redraws stay aligned on both. The map value is
// the PHONE's last requested size; the effective size is recomputed against the
// live container capacity on every fit, so desktop resizes are handled too.
// Entry present = a mirror client is attached; absent = the desktop owns its
// size and fits to its container as usual.
const remoteControlled = new Map<string, { cols: number; rows: number }>()

/**
 * Fit a surface to its container and push that size to the PTY. While a remote
 * mirror client drives this session, instead clamp both the desktop grid and
 * the shared PTY to min(phone viewport, desktop container) — so neither end is
 * clipped and `\r` redraws line up on both. (The desktop still owns the PTY
 * size here; it just never grows it past what the phone can show.)
 */
function fitAndPush(sessionId: string, term: XTerm, fit: FitAddon): void {
  const requested = remoteControlled.get(sessionId)
  if (requested) {
    try {
      const cap = fit.proposeDimensions()
      const cols = Math.max(1, Math.min(requested.cols, cap?.cols ?? requested.cols))
      const rows = Math.max(1, Math.min(requested.rows, cap?.rows ?? requested.rows))
      term.resize(cols, rows)
      void terminalResize(sessionId, cols, rows).catch(() => undefined)
    } catch {
      /* grid / container can be transiently invalid mid-layout */
    }
    return
  }
  try {
    fit.fit()
    void terminalResize(sessionId, term.cols, term.rows).catch(() => undefined)
  } catch {
    /* container can be 0px mid-layout */
  }
}

// ── Live theme + font sync ──────────────────────────────────────────────────
// The pool is non-React, so theme/font live-updates are wired imperatively via
// the stores' `subscribe` (mirroring the docked terminal's useXtermTheme /
// useTerminalFont* hooks). A single app-lifetime subscription updates every
// pooled instance, so themes and font settings apply to all open terminals.
let settingsSubscribed = false
let lastThemeId: string | null = null
let lastFontSignature = ''
let lastDefaultThemeId: string | null = null

function fontSignature(s: ReturnType<typeof useSettingsStore.getState>): string {
  return [
    s.terminalFontFamily,
    s.terminalFontSize,
    s.terminalLineHeight,
    s.terminalLetterSpacing,
    s.terminalFontWeight,
  ].join('|')
}

function applyThemeToAll(): void {
  const baseTheme = resolveBaseTheme()
  const tree = useTerminalAppStore.getState().tree
  pool.forEach((surface, id) => {
    // Tabs with their own scheme keep it; tabs without one follow the base
    // theme (the default terminal theme if set, else the app theme).
    if (findTerminalThemeById(findTabById(tree, id)?.themeId)) return
    surface.term.options.theme = baseTheme
    surface.element.style.backgroundColor = baseTheme.background
  })
}

function applyFontToAll(): void {
  const s = useSettingsStore.getState()
  const fontWeight = mapTerminalFontWeight(s.terminalFontWeight)
  const tree = useTerminalAppStore.getState().tree
  pool.forEach((surface, id) => {
    // font-family may be overridden per tab; size / line-height / spacing /
    // weight stay global.
    surface.term.options.fontFamily = resolveTabFontFamily(findTabById(tree, id))
    surface.term.options.fontSize = s.terminalFontSize
    surface.term.options.lineHeight = s.terminalLineHeight
    surface.term.options.letterSpacing = s.terminalLetterSpacing
    surface.term.options.fontWeight = fontWeight
    fitAndPush(id, surface.term, surface.fit)
  })
}

// ── Per-tab theme / font overrides ───────────────────────────────────────────
// A tab may override the global terminal theme and/or font-family (chosen from
// its context menu). These helpers resolve the effective values for a surface,
// and a store subscription re-applies them live without the store layer ever
// importing the pool.

function findTabById(tree: TermNode, sessionId: string): TermTab | undefined {
  return findLeafByTabId(tree, sessionId)?.tabs.find((t) => t.id === sessionId)
}

/**
 * Base terminal theme for tabs without a per-tab override: the user's default
 * terminal theme (Settings → Terminal appearance) if set, else the live app theme.
 */
function resolveBaseTheme() {
  const defaultTheme = findTerminalThemeById(
    useSettingsStore.getState().terminalDefaultThemeId,
  )
  return defaultTheme ? toXtermTheme(defaultTheme) : getXtermThemeColors()
}

/** Effective xterm theme for a tab: its per-tab scheme, else the base theme. */
function resolveTabTheme(tab: TermTab | undefined) {
  const theme = findTerminalThemeById(tab?.themeId)
  return theme ? toXtermTheme(theme) : resolveBaseTheme()
}

/** Effective xterm font-family for a tab: its override, else the global setting. */
function resolveTabFontFamily(tab: TermTab | undefined): string {
  return resolveTerminalFontFamily(
    tab?.fontFamily ?? useSettingsStore.getState().terminalFontFamily,
  )
}

// Per-session signature (`themeId|fontFamily`) of a tab's overrides; lets the
// store subscription re-apply only what actually changed. Neither a theme id
// nor a CSS font stack contains '|', so it is a safe field separator.
const tabOverrideSignature = new Map<string, string>()
function tabSignature(tab: TermTab | undefined): string {
  return `${tab?.themeId ?? ''}|${tab?.fontFamily ?? ''}`
}

/**
 * Re-apply per-tab theme/font overrides to any surface whose override changed.
 * Driven by a `useTerminalAppStore` subscription (the pool is non-React) so a
 * theme/font picked from a tab's context menu reaches the live xterm. Cheap: a
 * per-session signature gate skips unchanged tabs, and theme vs. font are
 * updated independently (only a font change needs a refit).
 */
function syncPerTabOverrides(): void {
  const tree = useTerminalAppStore.getState().tree
  pool.forEach((surface, id) => {
    const tab = findTabById(tree, id)
    const sig = tabSignature(tab)
    const prev = tabOverrideSignature.get(id)
    if (prev === sig) return
    tabOverrideSignature.set(id, sig)
    const [prevTheme, prevFont] = (prev ?? '|').split('|')
    const [nextTheme, nextFont] = sig.split('|')
    if (nextTheme !== prevTheme) {
      const nextTabTheme = resolveTabTheme(tab)
      surface.term.options.theme = nextTabTheme
      surface.element.style.backgroundColor = nextTabTheme.background
    }
    if (nextFont !== prevFont) {
      surface.term.options.fontFamily = resolveTabFontFamily(tab)
      fitAndPush(id, surface.term, surface.fit)
    }
  })
}

function ensureSettingsSubscriptions(): void {
  if (settingsSubscribed) return
  settingsSubscribed = true
  lastThemeId = useThemeStore.getState().activeThemeId
  lastFontSignature = fontSignature(useSettingsStore.getState())
  lastDefaultThemeId = useSettingsStore.getState().terminalDefaultThemeId
  useThemeStore.subscribe((state) => {
    if (state.activeThemeId === lastThemeId) return
    lastThemeId = state.activeThemeId
    applyThemeToAll()
  })
  useSettingsStore.subscribe((state) => {
    const signature = fontSignature(state)
    if (signature !== lastFontSignature) {
      lastFontSignature = signature
      applyFontToAll()
    }
    // The default terminal theme re-tints every tab that has no per-tab override.
    if (state.terminalDefaultThemeId !== lastDefaultThemeId) {
      lastDefaultThemeId = state.terminalDefaultThemeId
      applyThemeToAll()
    }
  })
  // Per-tab theme / font overrides live in the terminal-app store's tree.
  useTerminalAppStore.subscribe(syncPerTabOverrides)
}

function copySelection(term: XTerm): void {
  const sel = term.getSelection()
  if (sel) void writeText(sel).catch(() => undefined)
}

function pasteClipboard(term: XTerm): void {
  void readText()
    .then((text) => {
      if (text) term.paste(text) // respects bracketed-paste; routes via onData
    })
    .catch(() => undefined)
}

/**
 * Selection-aware key handler that preserves raw Ctrl+C → SIGINT:
 *  - macOS: Cmd+C copies (or is swallowed when no selection); Ctrl+C always
 *    falls through to the PTY as SIGINT. Cmd+V pastes. Cmd+K clears.
 *  - Win/Linux: Ctrl+C copies ONLY when there is a selection, otherwise sends
 *    SIGINT; Ctrl+Shift+C copies; Ctrl+Shift+V / Ctrl+V pastes; Ctrl+K clears.
 */
function makeKeyHandler(term: XTerm, sessionId: string) {
  return (event: KeyboardEvent): boolean => {
    if (event.type !== 'keydown') return true

    // ── History autocomplete interception ──────────────────────────────────
    // When a suggestion is active on the normal screen, a few keys drive the
    // ghost text / dropdown instead of going to the PTY. We fully consume them
    // (preventDefault + stopPropagation) so they neither reach the shell nor
    // bubble to the global shortcut dispatcher. When the shell is showing its
    // OWN completion menu below the prompt, we step aside entirely so the user
    // can navigate it (and our overlay is hidden to avoid stacking).
    if (term.buffer.active.type === 'normal' && !hasContentBelowCursor(term)) {
      const consume = (): boolean => {
        event.preventDefault()
        event.stopPropagation()
        return false
      }
      const k = event.key
      const plain =
        !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey
      const sugg = getSuggestion(sessionId)

      // Ctrl+Space → open the dropdown of ranked matches.
      if (
        event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        (k === ' ' || event.code === 'Space') &&
        sugg.items.length > 0
      ) {
        openDropdown(sessionId)
        return consume()
      }

      if (sugg.open) {
        if (plain && k === 'ArrowDown') {
          moveSelection(sessionId, 1)
          return consume()
        }
        if (plain && k === 'ArrowUp') {
          moveSelection(sessionId, -1)
          return consume()
        }
        if (plain && (k === 'Enter' || k === 'Tab' || k === 'ArrowRight')) {
          acceptSelected(sessionId)
          return consume()
        }
        if (k === 'Escape') {
          closeDropdown(sessionId)
          return consume()
        }
      } else if (
        sugg.ghost &&
        plain &&
        (k === 'ArrowRight' || k === 'End') &&
        !hasTextAfterCursor(term)
      ) {
        // Only accept OUR ghost when the shell isn't already showing one of its
        // own (else let →/End fall through so the shell's autosuggestion wins).
        acceptGhost(sessionId)
        return consume()
      }
    }

    const mod = IS_MAC ? event.metaKey : event.ctrlKey
    const key = event.key.toLowerCase()

    // Ctrl+Tab / Ctrl+Shift+Tab → app-level tab switching (terminal.nextTab /
    // terminal.prevTab). These use literal Ctrl on every platform, so hand the
    // keydown to the global shortcut dispatcher instead of letting xterm send a
    // tab character to the PTY.
    if (event.ctrlKey && !event.altKey && !event.metaKey && key === 'tab') {
      return false
    }

    // Clear — Mod+K
    if (mod && !event.altKey && !event.shiftKey && key === 'k') {
      event.preventDefault()
      term.clear()
      return false
    }

    if (key === 'c') {
      if (IS_MAC) {
        if (event.metaKey && !event.ctrlKey && !event.altKey) {
          if (term.hasSelection()) copySelection(term)
          event.preventDefault()
          return false // never forward Cmd+C to the PTY
        }
        return true // Ctrl+C → SIGINT
      }
      // Win/Linux
      if (event.ctrlKey && event.shiftKey && !event.altKey) {
        if (term.hasSelection()) copySelection(term)
        event.preventDefault()
        return false
      }
      if (event.ctrlKey && !event.shiftKey && !event.altKey && term.hasSelection()) {
        copySelection(term)
        event.preventDefault()
        return false
      }
      return true // Ctrl+C with no selection → SIGINT
    }

    if (key === 'v') {
      const paste = IS_MAC
        ? event.metaKey && !event.ctrlKey && !event.altKey
        : event.ctrlKey && !event.altKey // Ctrl+V or Ctrl+Shift+V
      if (paste) {
        pasteClipboard(term)
        event.preventDefault()
        return false
      }
    }

    // macOS: ⌘-modified keys are application shortcuts (close/new tab, split,
    // pin, the ⌘K⌘W "close all" chord, ⌘1–9 app switching…), never terminal
    // input. Return false so xterm ignores them and the keydown bubbles to the
    // global shortcut dispatcher. ⌘W additionally gets its native "Close
    // Window" accelerator suppressed here — otherwise it escapes to the OS and
    // pops the quit-confirm modal before `terminal.closeTab` can run. (⌘K/⌘C/⌘V
    // are handled above; Ctrl and Option keep flowing to the PTY for
    // SIGINT/readline/meta.)
    if (IS_MAC && event.metaKey && !event.ctrlKey) {
      if (key === 'w' && !event.altKey && !event.shiftKey) {
        event.preventDefault()
      }
      return false
    }

    return true
  }
}

function handleOsc7(sessionId: string, data: string): void {
  if (!data || data.length > 4096) return
  const match = /^file:\/\/[^/]*(\/.*)$/.exec(data)
  if (!match) return
  let path = match[1]
  try {
    path = decodeURIComponent(path)
  } catch {
    /* keep raw path on malformed escapes */
  }
  useTerminalAppStore.getState().setSessionCwd(sessionId, path)
}

function createSurface(sessionId: string): PooledSurface {
  ensureSettingsSubscriptions()
  const settings = useSettingsStore.getState()
  const tab = findTabById(useTerminalAppStore.getState().tree, sessionId)
  tabOverrideSignature.set(sessionId, tabSignature(tab))
  const tabTheme = resolveTabTheme(tab)

  const element = document.createElement('div')
  // A little breathing room around the terminal content. The element background
  // is painted with the (per-tab) terminal background, so the padding — and any
  // region the xterm canvas doesn't cover (a remote-mirror letterbox, or a
  // fractional last row mid-resize) — shows the theme colour rather than the
  // app's near-black background.
  element.className = 'absolute inset-0 p-3'
  element.style.backgroundColor = tabTheme.background
  element.dataset.sessionId = sessionId

  const term = new XTerm({
    fontFamily: resolveTabFontFamily(tab),
    fontSize: settings.terminalFontSize,
    lineHeight: settings.terminalLineHeight,
    letterSpacing: settings.terminalLetterSpacing,
    fontWeight: mapTerminalFontWeight(settings.terminalFontWeight),
    cursorBlink: true,
    cursorStyle: 'bar',
    allowProposedApi: true,
    convertEol: false,
    scrollback: 5000,
    theme: tabTheme,
  })
  const fit = new FitAddon()
  const serialize = new SerializeAddon()
  term.loadAddon(fit)
  term.loadAddon(serialize)
  term.loadAddon(new WebLinksAddon())
  term.attachCustomKeyEventHandler(makeKeyHandler(term, sessionId))
  term.open(element)

  // Replay this tab's saved scrollback (session restore) BEFORE wiring live
  // output, so the previous session's history is written above the fresh
  // shell's first prompt. Consumes the staged entry so it replays exactly once.
  // A dim marker + trailing newline separates the restored history from the
  // fresh shell's prompt so the two never visually merge on one line.
  const replay = takePendingReplay(sessionId)
  if (replay) {
    term.write(replay)
    term.write('\r\n\x1b[2m── session restored ──\x1b[0m\r\n')
  }

  const unsubOutput = terminalOutputBus.subscribeOutput(sessionId, (bytes) => {
    term.write(bytes)
  })
  const unsubExit = terminalOutputBus.subscribeExit(sessionId, (code) => {
    useTerminalAppStore.getState().handleSessionExit(sessionId, code)
  })

  const disposables: IDisposable[] = [
    term.onData((str) => {
      feedTerminalLine(sessionId, str, term)
      terminalWrite(sessionId, encodeBase64(str)).catch((err) => {
        console.warn('[TerminalApp] write failed', err)
      })
    }),
    term.parser.registerOscHandler(7, (payload) => {
      handleOsc7(sessionId, payload)
      return true
    }),
  ]

  const resizeObserver = new ResizeObserver(() => {
    if (resizeSuppressed) return
    fitAndPush(sessionId, term, fit)
  })
  resizeObserver.observe(element)

  return { term, fit, serialize, element, unsubOutput, unsubExit, disposables, resizeObserver }
}

/** Attach a session's surface into `container`, creating it on first use. */
export function acquireSurface(sessionId: string, container: HTMLElement): void {
  let surface = pool.get(sessionId)
  if (!surface) {
    surface = createSurface(sessionId)
    pool.set(sessionId, surface)
  }
  container.appendChild(surface.element)
  requestAnimationFrame(() => {
    if (surface) fitAndPush(sessionId, surface.term, surface.fit)
  })
}

/** Detach a session's surface from the DOM but keep it alive (e.g. on split). */
export function releaseSurface(sessionId: string): void {
  pool.get(sessionId)?.element.remove()
}

/** Re-fit a visible surface (call when a hidden tab becomes active). */
export function refitSurface(sessionId: string): void {
  const surface = pool.get(sessionId)
  if (!surface) return
  requestAnimationFrame(() => {
    fitAndPush(sessionId, surface.term, surface.fit)
  })
}

/**
 * Pause/resume the ResizeObserver-driven refit for all surfaces. While a
 * neighbouring panel (e.g. the git changes panel) is being drag-resized,
 * suppressing avoids a per-frame scrollback reflow + PTY resize (which lags the
 * drag); resuming re-fits every live surface once so they catch up to the final
 * size.
 */
export function setSurfaceResizeSuppressed(suppressed: boolean): void {
  resizeSuppressed = suppressed
  if (suppressed) return
  for (const [sessionId, surface] of pool) {
    const { term, fit } = surface
    requestAnimationFrame(() => fitAndPush(sessionId, term, fit))
  }
}

/**
 * Serialize a session's live xterm buffer (viewport + scrollback) to an ANSI
 * string for on-disk persistence. Returns `null` when the surface isn't live
 * (e.g. a hidden tab whose surface was GC'd) so the caller can skip the save.
 */
export function serializeSurface(sessionId: string): string | null {
  const surface = pool.get(sessionId)
  if (!surface) return null
  try {
    return surface.serialize.serialize()
  } catch {
    return null
  }
}

/**
 * A remote mirror client now drives this session's size: remember the phone's
 * requested viewport and re-fit, which clamps both the desktop grid and the
 * shared PTY to min(phone, desktop container) so neither end is clipped and both
 * show the whole screen. Safe to call before the surface exists (applied on its
 * next fit).
 */
export function setRemoteControlledSize(
  sessionId: string,
  cols: number,
  rows: number,
): void {
  remoteControlled.set(sessionId, { cols, rows })
  const surface = pool.get(sessionId)
  if (!surface) return
  fitAndPush(sessionId, surface.term, surface.fit)
}

/**
 * A remote mirror client released this session: drop the override and re-fit to
 * the desktop container, restoring (and re-pushing) the desktop's own size.
 */
export function clearRemoteControlledSize(sessionId: string): void {
  if (!remoteControlled.delete(sessionId)) return
  refitSurface(sessionId)
}

/** Whether a live xterm surface exists (mounted + attached) for this session. */
export function isSurfaceReady(sessionId: string): boolean {
  return pool.has(sessionId)
}

/** The live xterm instance for a session, or `null` when no surface exists.
 * Used by the autocomplete overlay to read cursor coordinates + cell metrics. */
export function getSurfaceTerm(sessionId: string): XTerm | null {
  return pool.get(sessionId)?.term ?? null
}

/**
 * True when the prompt row has non-blank cells to the RIGHT of the caret — i.e.
 * the shell is already drawing its own inline autosuggestion (zsh-autosuggestions,
 * fish, etc.). Used to suppress our duplicate ghost text and to defer the
 * →/End accept key to the shell so we don't double up.
 */
export function hasTextAfterCursor(term: XTerm): boolean {
  const buf = term.buffer.active
  const line = buf.getLine(buf.baseY + buf.cursorY)
  if (!line) return false
  for (let x = buf.cursorX; x < term.cols; x++) {
    const chars = line.getCell(x)?.getChars()
    if (chars && chars.trim() !== '') return true
  }
  return false
}

/**
 * True when the row just below the caret has non-blank content — i.e. the shell
 * is drawing its own completion menu/list under the prompt (native Tab
 * completion, zsh-autocomplete, etc.). Used to hide our overlay and step our
 * key intercepts aside so the two never stack, letting the user drive the
 * shell's menu directly.
 */
export function hasContentBelowCursor(term: XTerm): boolean {
  const buf = term.buffer.active
  const line = buf.getLine(buf.baseY + buf.cursorY + 1)
  if (!line) return false
  for (let x = 0; x < term.cols; x++) {
    const chars = line.getCell(x)?.getChars()
    if (chars && chars.trim() !== '') return true
  }
  return false
}

/** Move keyboard focus into a session's terminal (used by pane/tab shortcuts). */
export function focusSurface(sessionId: string): void {
  const surface = pool.get(sessionId)
  if (!surface) return
  try {
    surface.term.focus()
  } catch {
    /* noop */
  }
}

/**
 * Insert `text` into a session's terminal as bracketed paste — it routes through
 * xterm's `onData` to the PTY stdin, so the shell receives it as typed input
 * (multi-line safe; embedded newlines are not auto-executed). When `opts.run`
 * is set, a trailing carriage return is sent OUTSIDE the paste to submit it.
 */
export function pasteIntoSurface(
  sessionId: string,
  text: string,
  opts?: { run?: boolean },
): void {
  const surface = pool.get(sessionId)
  if (!surface || !text) return
  surface.term.paste(text)
  if (opts?.run) {
    void terminalWrite(sessionId, encodeBase64('\r')).catch(() => undefined)
    return
  }
  // After a bracketed paste, zsh (and some other shells) keep the pasted region
  // highlighted as if it were selected (zsh's default `zle_highlight` has
  // `paste:standout`). A single forward-char — a no-op at the end of the buffer
  // where the cursor now sits — triggers a ZLE redraw that drops the highlight
  // without changing the text. Only meaningful while bracketed-paste mode is on
  // (i.e. at a shell prompt), so it never disturbs raw/TUI apps.
  if (surface.term.modes.bracketedPasteMode) {
    void terminalWrite(sessionId, encodeBase64('\x1b[C')).catch(() => undefined)
  }
}

function disposeSurface(sessionId: string): void {
  const surface = pool.get(sessionId)
  if (!surface) return
  surface.unsubOutput()
  surface.unsubExit()
  surface.resizeObserver.disconnect()
  surface.disposables.forEach((d) => {
    try {
      d.dispose()
    } catch {
      /* noop */
    }
  })
  try {
    surface.term.dispose()
  } catch {
    /* noop */
  }
  surface.element.remove()
  remoteControlled.delete(sessionId)
  tabOverrideSignature.delete(sessionId)
  dropTerminalLine(sessionId)
  dropSuggestion(sessionId)
  pool.delete(sessionId)
}

/** Dispose every pooled surface whose session id is no longer live. */
export function gcSurfaces(liveSessionIds: Set<string>): void {
  for (const id of [...pool.keys()]) {
    if (!liveSessionIds.has(id)) disposeSurface(id)
  }
}
