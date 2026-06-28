import { useLibraryStore } from '@/store/library-store'

export function useBookOverview() {
  const hasActiveBook = useLibraryStore((s) => s.activeBook !== null)
  return { hasActiveBook }
}
