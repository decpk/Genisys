import { useEffect } from 'react'

import { useWebpointStore } from '@/store/webpoint-store'

export function useWebpointHomeData() {
  const presentations = useWebpointStore((s) => s.presentations)
  const isLoaded = useWebpointStore((s) => s.isLoaded)
  const loadPresentations = useWebpointStore((s) => s.loadPresentations)
  const createPresentation = useWebpointStore((s) => s.createPresentation)
  const selectPresentation = useWebpointStore((s) => s.selectPresentation)
  const removePresentation = useWebpointStore((s) => s.removePresentation)

  useEffect(() => {
    if (!isLoaded) {
      void loadPresentations()
    }
  }, [isLoaded, loadPresentations])

  const onCreate = (): void => {
    void createPresentation()
  }
  const onSelect = (id: string): void => {
    void selectPresentation(id)
  }
  const onRemove = (id: string): void => {
    void removePresentation(id)
  }

  return { presentations, isLoaded, onCreate, onSelect, onRemove }
}
