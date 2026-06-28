import { useEffect, useRef } from 'react'

import { useCommandPaletteStore } from '@/store/command-palette-store'

export function usePaletteInputData(): { inputRef: React.RefObject<HTMLInputElement | null> } {
  const isOpen = useCommandPaletteStore((s) => s.isOpen)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const handle = window.requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
    return () => window.cancelAnimationFrame(handle)
  }, [isOpen])

  return { inputRef }
}
