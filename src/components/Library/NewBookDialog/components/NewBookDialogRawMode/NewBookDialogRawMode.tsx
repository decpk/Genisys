import { GripVertical } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { MarkdownPreview } from '../MarkdownPreview'
import { ModeToggle } from '../ModeToggle'
import { RawMarkdownField } from '../RawMarkdownField'
import { selectCreateLabel } from '../../utils/selectCreateLabel'

import {
  DESCRIPTION_INPUT,
  EDITOR_PANE,
  PANE_LABELS_ROW,
  PANE_LABEL,
  PANE_LABEL_HINT,
  PANE_LABEL_RIGHT,
  PREVIEW_PANE,
  RESIZER,
  RESIZER_ICON,
  SPLIT_ROW,
  TITLE_INPUT,
  TITLE_LABEL,
  TOP_BAR,
  TOP_BAR_RIGHT,
} from './NewBookDialogRawMode.styles'
import type { NewBookDialogRawModeProps } from './NewBookDialogRawMode.types'

export function NewBookDialogRawMode(props: NewBookDialogRawModeProps): React.JSX.Element {
  const { data, onCancel } = props
  const createLabel = selectCreateLabel(data.mode, data.contentType, data.sourceType)
  const leftPercent = `${(data.leftFraction * 100).toFixed(1)}%`
  const rightPercent = `${((1 - data.leftFraction) * 100).toFixed(1)}%`

  return (
    <>
      <div className={TOP_BAR}>
        <h2 className={TITLE_LABEL}>Create New Book</h2>

        <Input
          placeholder="Book title"
          value={data.title}
          onChange={(e) => data.setTitle(e.target.value)}
          className={TITLE_INPUT}
          autoFocus
        />
        <Input
          placeholder="Description (optional)"
          value={data.description}
          onChange={(e) => data.setDescription(e.target.value)}
          className={DESCRIPTION_INPUT}
        />

        <ModeToggle mode={data.mode} onModeChange={data.setMode} />

        <div className={TOP_BAR_RIGHT}>
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" disabled={data.isCreateDisabled} onClick={data.handleCreate}>
            {createLabel}
          </Button>
        </div>
      </div>

      <div className={PANE_LABELS_ROW}>
        <div className={PANE_LABEL} style={{ width: leftPercent }}>
          Editor
          <span className={PANE_LABEL_HINT}>Use {'<lib-chapter-break />'} on its own line to start a new chapter</span>
        </div>
        <div className={PANE_LABEL_RIGHT} style={{ width: rightPercent }}>
          Preview
        </div>
      </div>

      <div ref={data.splitContainerRef} className={SPLIT_ROW}>
        <div className={EDITOR_PANE} style={{ width: leftPercent }}>
          <RawMarkdownField value={data.rawMarkdown} onChange={data.handleRawMarkdownChange} />
        </div>

        <div className={RESIZER} onMouseDown={data.handleSplitMouseDown}>
          <GripVertical size={12} className={RESIZER_ICON} />
        </div>

        <div className={PREVIEW_PANE} style={{ width: rightPercent }}>
          <MarkdownPreview value={data.rawMarkdown} />
        </div>
      </div>
    </>
  )
}
