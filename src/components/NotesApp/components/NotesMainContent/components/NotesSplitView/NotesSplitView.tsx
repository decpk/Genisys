import type { CSSProperties } from 'react'

import { cn } from '@/lib/utils'

import { NotesSplitDivider } from '../NotesSplitDivider'
import { NotesSplitPane } from './NotesSplitPane'
import { useNotesSplitViewData } from './useNotesSplitViewData'

export function NotesSplitView(): React.JSX.Element | null {
  const {
    splitState,
    firstNote,
    secondNote,
    showLabels,
    containerRef,
    handleUpdateNote,
    handleToggleMode,
    handleToggleOrientation,
    handleResetRatio,
    setActivePane,
    setPaneMode,
    setPaneContentWidth,
    setPaneNote,
    setSplitRatio,
    swapPanes,
    closeSplit,
  } = useNotesSplitViewData()

  if (!splitState || !firstNote || !secondNote) return null

  const { orientation, ratio, activeIndex } = splitState
  const directionClass = orientation === 'side-by-side' ? 'flex-row' : 'flex-col'
  const firstStyle: CSSProperties = { flexBasis: `${ratio * 100}%`, flexGrow: 0, flexShrink: 0 }
  const secondStyle: CSSProperties = { flexBasis: 0, flexGrow: 1, flexShrink: 1 }

  return (
    <div ref={containerRef} className={cn('flex h-full min-h-0 overflow-hidden', directionClass)}>
      <NotesSplitPane
        note={firstNote}
        isActive={activeIndex === 0}
        mode={splitState.panes[0].mode}
        contentWidth={splitState.panes[0].contentWidth}
        showLabels={showLabels}
        orientation={orientation}
        style={firstStyle}
        onUpdateNote={handleUpdateNote}
        onModeChange={(mode) => setPaneMode(0, mode)}
        onContentWidthChange={(width) => setPaneContentWidth(0, width)}
        onToggleMode={() => handleToggleMode(0)}
        onFocus={() => setActivePane(0)}
        onToggleOrientation={handleToggleOrientation}
        onSwap={swapPanes}
        onClose={() => closeSplit(1)}
        onDropNote={(noteId) => setPaneNote(0, noteId)}
      />

      <NotesSplitDivider
        orientation={orientation}
        containerRef={containerRef}
        onRatioChange={setSplitRatio}
        onReset={handleResetRatio}
      />

      <NotesSplitPane
        note={secondNote}
        isActive={activeIndex === 1}
        mode={splitState.panes[1].mode}
        contentWidth={splitState.panes[1].contentWidth}
        showLabels={showLabels}
        orientation={orientation}
        style={secondStyle}
        onUpdateNote={handleUpdateNote}
        onModeChange={(mode) => setPaneMode(1, mode)}
        onContentWidthChange={(width) => setPaneContentWidth(1, width)}
        onToggleMode={() => handleToggleMode(1)}
        onFocus={() => setActivePane(1)}
        onToggleOrientation={handleToggleOrientation}
        onSwap={swapPanes}
        onClose={() => closeSplit(0)}
        onDropNote={(noteId) => setPaneNote(1, noteId)}
      />
    </div>
  )
}
