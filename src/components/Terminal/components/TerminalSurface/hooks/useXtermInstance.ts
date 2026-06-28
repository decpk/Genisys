import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { useEffect, useRef } from 'react'

import { useSettingsStore } from '@/store/settings-store'

import { mapTerminalFontWeight } from '../../../utils/mapTerminalFontWeight'
import { resolveTerminalFontFamily } from '../../../utils/resolveTerminalFontFamily'
import { getXtermThemeColors } from '../../../utils/getXtermThemeColors'

interface XtermBundle {
  term: XTerm
  fit: FitAddon
}

/** Creates a single xterm instance per session and mounts it into `container`.
 *  Returns refs so other hooks (IO, autofit) can interact with it. */
export function useXtermInstance(container: React.RefObject<HTMLDivElement | null>) {
  const bundleRef = useRef<XtermBundle | null>(null)

  useEffect(() => {
    if (!container.current) return
    const settings = useSettingsStore.getState()
    const term = new XTerm({
      fontFamily: resolveTerminalFontFamily(settings.terminalFontFamily),
      fontSize: settings.terminalFontSize,
      lineHeight: settings.terminalLineHeight,
      letterSpacing: settings.terminalLetterSpacing,
      fontWeight: mapTerminalFontWeight(settings.terminalFontWeight),
      cursorBlink: true,
      cursorStyle: 'bar',
      allowProposedApi: true,
      convertEol: false,
      scrollback: 5000,
      theme: getXtermThemeColors(),
    })
    const fit = new FitAddon()
    const links = new WebLinksAddon()
    term.loadAddon(fit)
    term.loadAddon(links)

    // Cmd/Ctrl+K clears the terminal — only fires while xterm has focus.
    // Returning `false` prevents xterm from forwarding the keystroke to the PTY
    // (Ctrl+K is "kill-to-end-of-line" in readline; we intentionally override it).
    term.attachCustomKeyEventHandler((event) => {
      if (event.type !== 'keydown') return true
      const isClear =
        (event.key === 'k' || event.key === 'K') &&
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        !event.shiftKey
      if (isClear) {
        event.preventDefault()
        term.clear()
        return false
      }
      return true
    })

    term.open(container.current)
    try {
      fit.fit()
    } catch {
      /* container may be 0px on first paint; autofit hook handles later */
    }
    bundleRef.current = { term, fit }

    return () => {
      try {
        term.dispose()
      } catch {
        /* noop */
      }
      bundleRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return bundleRef
}

export type { XtermBundle }
