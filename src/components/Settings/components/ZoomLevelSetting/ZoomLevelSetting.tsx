import { memo, useCallback, useEffect, useState } from 'react'
import { Minus, Plus, RotateCcw } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'
import { SettingRow } from '../SettingRow'

export const ZoomLevelSetting = memo(function ZoomLevelSetting(): React.JSX.Element {
  const [zoomLevel, setZoomLevel] = useState(0)

  useEffect(() => {
    window.api.getZoomLevel().then(setZoomLevel)
    return window.api.onZoomChanged(setZoomLevel)
  }, [])

  const zoomPercent = Math.round(Math.pow(1.2, zoomLevel) * 100)
  const zoomPx = Math.round(16 * Math.pow(1.2, zoomLevel) * 10) / 10

  const handleZoomIn = useCallback(async () => {
    const level = await window.api.zoomIn()
    setZoomLevel(level)
  }, [])

  const handleZoomOut = useCallback(async () => {
    const level = await window.api.zoomOut()
    setZoomLevel(level)
  }, [])

  const handleZoomReset = useCallback(async () => {
    const level = await window.api.zoomReset()
    setZoomLevel(level)
  }, [])

  return (
    <SettingRow
      label="Zoom level"
      description={`Adjust the overall zoom level of the application (base: 16px). Use Cmd/Ctrl + and Cmd/Ctrl - as keyboard shortcuts. Current font size: ${zoomPx}px.`}
    >
      <div className="flex items-center gap-2">
        <IconButton
          tooltip="Zoom out"
          shortcut="Cmd+-"
          tooltipSide="bottom"
          className="border border-border"
          onClick={handleZoomOut}
        >
          <Minus size={14} />
        </IconButton>
        <span className="text-sm text-foreground min-w-[4ch] text-center">
          {zoomPercent}%
        </span>
        <IconButton
          tooltip="Zoom in"
          shortcut="Cmd+="
          tooltipSide="bottom"
          className="border border-border"
          onClick={handleZoomIn}
        >
          <Plus size={14} />
        </IconButton>
        {zoomLevel !== 0 && (
          <IconButton
            tooltip="Reset to 100%"
            tooltipSide="bottom"
            className="border border-border ml-1"
            onClick={handleZoomReset}
          >
            <RotateCcw size={14} />
          </IconButton>
        )}
      </div>
    </SettingRow>
  );
})
