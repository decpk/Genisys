import { useRef } from 'react'

import { cn } from '@/lib/utils'

import { terminalStyles } from '../../Terminal.styles'
import type { TerminalSurfaceProps } from '../../Terminal.types'
import { useTerminalAutoFit } from './hooks/useTerminalAutoFit'
import { useTerminalFont } from './hooks/useTerminalFont'
import { useTerminalFontSize } from './hooks/useTerminalFontSize'
import { useTerminalFontWeight } from './hooks/useTerminalFontWeight'
import { useTerminalIO } from './hooks/useTerminalIO'
import { useTerminalLetterSpacing } from './hooks/useTerminalLetterSpacing'
import { useTerminalLineHeight } from './hooks/useTerminalLineHeight'
import { useXtermInstance } from './hooks/useXtermInstance'
import { useXtermTheme } from './hooks/useXtermTheme'

export function TerminalSurface(props: TerminalSurfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bundleRef = useXtermInstance(containerRef)
  useTerminalIO(bundleRef, props.sessionId)
  useTerminalFont(bundleRef)
  useTerminalFontSize(bundleRef)
  useTerminalLineHeight(bundleRef)
  useTerminalLetterSpacing(bundleRef)
  useTerminalFontWeight(bundleRef)
  useXtermTheme(bundleRef)
  useTerminalAutoFit(containerRef, bundleRef, props.sessionId, props.visible)

  const className = cn(terminalStyles.surface, props.visible ? '' : terminalStyles.surfaceHidden)

  return <div ref={containerRef} className={className} data-session-id={props.sessionId} />
}
