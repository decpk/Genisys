import { useTerminalStore } from '@/store/terminal-store'

interface UseTerminalFontSizePickerDataReturn {
  fontSize: number
  options: number[]
  setFontSize: (size: number) => void
}

const SIZE_OPTIONS = [10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24]

export function useTerminalFontSizePickerData(): UseTerminalFontSizePickerDataReturn {
  const fontSize = useTerminalStore((s) => s.terminalFontSize)
  const setFontSize = useTerminalStore((s) => s.setTerminalFontSize)

  return {
    fontSize,
    options: SIZE_OPTIONS,
    setFontSize,
  }
}
