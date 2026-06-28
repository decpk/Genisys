import { ExplorerItemDialogs } from '../ExplorerItemDialogs'
import { useExplorerKeyboardOperationsData } from './hooks/useExplorerKeyboardOperationsData'
import type { ExplorerKeyboardOperationsProps } from './ExplorerKeyboardOperations.types'

export function ExplorerKeyboardOperations(props: ExplorerKeyboardOperationsProps) {
  const { data } = useExplorerKeyboardOperationsData(props)

  return <ExplorerItemDialogs data={data} />
}
