import { TocPanelDataProvider } from '@/right-panels/TocPanel'

import type { NotesTocPanelWrapperProps } from './NotesTocPanelWrapper.types'
import { useNotesTocPanelData } from './useNotesTocPanelData'

/**
 * Bridges the `NotesTocProvider` context into the generic `TocPanel` framework.
 * Used as the `wrapper` for the Notes "On this page" right-panel tab.
 */
export function NotesTocPanelWrapper(props: NotesTocPanelWrapperProps): React.JSX.Element {
  const { children } = props
  const { data, actions } = useNotesTocPanelData()

  return (
    <TocPanelDataProvider data={data} actions={actions}>
      {children}
    </TocPanelDataProvider>
  )
}
