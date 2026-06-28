import { useQuitConfirmStore } from '@/store/quit-confirm-store'

export function useQuitConfirmIsOpen(): boolean {
  return useQuitConfirmStore((s) => s.isOpen)
}
