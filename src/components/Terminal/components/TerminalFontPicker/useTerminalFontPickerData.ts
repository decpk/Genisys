import { useTerminalStore } from '@/store/terminal-store'
import type { ReadingFont } from '@/store/settings-store'
import { FONT_CONFIG, READING_FONT_OPTIONS } from '@/lib/fonts'

interface UseTerminalFontPickerDataReturn {
  terminalFont: ReadingFont
  options: typeof READING_FONT_OPTIONS
  fontConfig: typeof FONT_CONFIG
  setTerminalFont: (font: ReadingFont) => void
}

export function useTerminalFontPickerData(): UseTerminalFontPickerDataReturn {
  const terminalFont = useTerminalStore((s) => s.terminalFont)
  const setTerminalFont = useTerminalStore((s) => s.setTerminalFont)

  return {
    terminalFont,
    options: READING_FONT_OPTIONS,
    fontConfig: FONT_CONFIG,
    setTerminalFont,
  }
}
