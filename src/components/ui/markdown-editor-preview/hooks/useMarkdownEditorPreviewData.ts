import { useRef } from 'react'
import type * as monaco from 'monaco-editor'

import { useScrollSync } from './useScrollSync'
import { useSplitResize } from './useSplitResize'

export function useMarkdownEditorPreviewData(
  scrollSyncEnabled: boolean,
  defaultSplitFraction: number,
  minSplitFraction: number,
  maxSplitFraction: number,
) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const splitContainerRef = useRef<HTMLDivElement>(null)

  useScrollSync(editorRef, previewRef, scrollSyncEnabled)
  const { leftFraction, handleMouseDown } = useSplitResize(
    splitContainerRef,
    defaultSplitFraction,
    minSplitFraction,
    maxSplitFraction,
  )

  const leftPercent = `${(leftFraction * 100).toFixed(1)}%`
  const rightPercent = `${((1 - leftFraction) * 100).toFixed(1)}%`

  return {
    editorRef,
    previewRef,
    splitContainerRef,
    leftPercent,
    rightPercent,
    handleMouseDown,
  }
}
