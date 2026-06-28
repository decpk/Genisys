import { Minus, Plus, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { IconButton } from "@/components/ui/icon-button";

interface ZoomControlsProps {
  tooltipSide: "top" | "bottom" | "left" | "right";
}

export function ZoomControls({
  tooltipSide,
}: ZoomControlsProps): React.JSX.Element {
  const [zoomLevel, setZoomLevel] = useState(0);

  useEffect(() => {
    window.api.getZoomLevel().then(setZoomLevel);
    return window.api.onZoomChanged(setZoomLevel);
  }, []);

  const zoomPercent = Math.round(Math.pow(1.2, zoomLevel) * 100);

  const handleZoomIn = useCallback(async () => {
    const level = await window.api.zoomIn();
    setZoomLevel(level);
  }, []);

  const handleZoomOut = useCallback(async () => {
    const level = await window.api.zoomOut();
    setZoomLevel(level);
  }, []);

  const handleZoomReset = useCallback(async () => {
    const level = await window.api.zoomReset();
    setZoomLevel(level);
  }, []);

  return (
    <div className="flex flex-col items-center gap-0.5 rounded-lg p-1">
      <IconButton
        tooltip="Zoom out"
        shortcut="Cmd+-"
        tooltipSide={tooltipSide}
        size="lg"
        onClick={handleZoomOut}
      >
        <Minus size={20} />
      </IconButton>
      <span className="text-[10px] text-muted-foreground min-w-[3.5ch] text-center">
        {zoomPercent}%
      </span>
      <IconButton
        tooltip="Zoom in"
        shortcut="Cmd+="
        tooltipSide={tooltipSide}
        size="lg"
        onClick={handleZoomIn}
      >
        <Plus size={20} />
      </IconButton>
      {zoomLevel !== 0 && (
        <IconButton
          tooltip="Reset to 100%"
          shortcut="Cmd+0"
          tooltipSide={tooltipSide}
          size="lg"
          onClick={handleZoomReset}
        >
          <RotateCcw size={18} />
        </IconButton>
      )}
    </div>
  );
}
