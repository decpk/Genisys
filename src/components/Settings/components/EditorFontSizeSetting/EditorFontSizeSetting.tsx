import { memo, useCallback } from 'react'
import { Minus, Plus, RotateCcw } from 'lucide-react'

import { useSettingsStore } from '@/store/settings-store'
import { IconButton } from '@/components/ui/icon-button'
import { SettingRow } from '../SettingRow'

const MIN_EDITOR_FONT_SIZE = 10
const MAX_EDITOR_FONT_SIZE = 24
const DEFAULT_EDITOR_FONT_SIZE = 10
const STEP = 1

export const EditorFontSizeSetting = memo(function EditorFontSizeSetting(): React.JSX.Element {
  const editorFontSize = useSettingsStore((s) => s.editorFontSize)
  const setEditorFontSize = useSettingsStore((s) => s.setEditorFontSize)

  const handleIncrease = useCallback(() => {
    setEditorFontSize(Math.min(editorFontSize + STEP, MAX_EDITOR_FONT_SIZE))
  }, [editorFontSize, setEditorFontSize])

  const handleDecrease = useCallback(() => {
    setEditorFontSize(Math.max(editorFontSize - STEP, MIN_EDITOR_FONT_SIZE))
  }, [editorFontSize, setEditorFontSize])

  const handleReset = useCallback(() => {
    setEditorFontSize(DEFAULT_EDITOR_FONT_SIZE)
  }, [setEditorFontSize])

  return (
    <SettingRow
      label="Editor font size"
      description={`Font size used by code editors across all apps (API Client, Project Explorer, Mock Server, etc.). Does not affect rich-text editors. Range: ${MIN_EDITOR_FONT_SIZE}–${MAX_EDITOR_FONT_SIZE}px.`}
    >
      <div className="flex items-center gap-2">
        <IconButton
          tooltip="Decrease editor font size"
          tooltipSide="bottom"
          className="border border-border"
          onClick={handleDecrease}
          disabled={editorFontSize <= MIN_EDITOR_FONT_SIZE}
        >
          <Minus size={14} />
        </IconButton>
        <span className="text-sm text-foreground min-w-[4ch] text-center">
          {editorFontSize}px
        </span>
        <IconButton
          tooltip="Increase editor font size"
          tooltipSide="bottom"
          className="border border-border"
          onClick={handleIncrease}
          disabled={editorFontSize >= MAX_EDITOR_FONT_SIZE}
        >
          <Plus size={14} />
        </IconButton>
        {editorFontSize !== DEFAULT_EDITOR_FONT_SIZE && (
          <IconButton
            tooltip={`Reset to ${DEFAULT_EDITOR_FONT_SIZE}px`}
            tooltipSide="bottom"
            className="border border-border ml-1"
            onClick={handleReset}
          >
            <RotateCcw size={14} />
          </IconButton>
        )}
      </div>
    </SettingRow>
  )
})
