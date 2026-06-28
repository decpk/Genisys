import { useState, useCallback } from 'react'
import type { EditorSectionProps } from './EditorSection.types'

export function useEditorSectionData(
  props: Pick<EditorSectionProps, 'defaultExpanded'>
) {
  const { defaultExpanded } = props
  const [expanded, setExpanded] = useState(defaultExpanded)

  const toggle = useCallback(() => {
    setExpanded((prev) => !prev)
  }, [])

  return { expanded, toggle }
}
