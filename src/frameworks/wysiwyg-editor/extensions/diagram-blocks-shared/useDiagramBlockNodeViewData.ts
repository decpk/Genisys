import { useCallback, useState } from 'react'
import type { NodeViewProps } from '@tiptap/react'

/**
 * Shared logic for the live diagram/chart atom node views. Owns the
 * source <-> attribute binding and the preview/edit toggle. The View layers
 * (`MermaidBlockNodeView`, `ChartBlockNodeView`) consume this return object.
 */
export function useDiagramBlockNodeViewData(props: NodeViewProps) {
  const { node, updateAttributes } = props
  const source = (node.attrs.source as string | undefined) ?? ''
  const [showSource, setShowSource] = useState(false)

  const toggleSource = useCallback(() => {
    setShowSource((previous) => !previous)
  }, [])

  const onSourceChange = useCallback(
    (value: string) => {
      updateAttributes({ source: value })
    },
    [updateAttributes],
  )

  return { source, showSource, toggleSource, onSourceChange }
}
