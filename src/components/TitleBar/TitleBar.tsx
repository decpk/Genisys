import { getCurrentWindow } from "@tauri-apps/api/window";
import { Bug, Minus, Plus, RotateCcw, RotateCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { GenisysIcon } from "@/components/GenisysIcon";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { IconButton } from "@/components/ui/icon-button";
import api from "@/tauri-api-bridge";

const appWindow = getCurrentWindow();

export function TitleBar(): React.JSX.Element {
  const [zoomLevel, setZoomLevel] = useState(0);

  useEffect(() => {
    window.api.getZoomLevel().then(setZoomLevel);
    return window.api.onZoomChanged(setZoomLevel);
  }, []);

  const zoomPercent = Math.round(Math.pow(1.2, zoomLevel) * 100);

  const handleDrag = useCallback((e: React.MouseEvent) => {
    // Only drag when clicking directly on the drag region, not on buttons
    if ((e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    void appWindow.startDragging();
  }, []);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    void appWindow.toggleMaximize();
  }, []);

  return (
    <div
      onMouseDown={handleDrag}
      onDoubleClick={handleDoubleClick}
      className="group titlebar sidebar-theme flex items-center justify-between shrink-0 h-[38px] bg-card border-b border-border/40 select-none cursor-default"
    >
      {/* Left: traffic-light spacing + app title */}
      <div className="flex items-center gap-1.5 pl-[80px] text-xs font-medium text-muted-foreground pointer-events-none">
        <GenisysIcon size={16} className="text-muted-foreground" />
        Genisys
      </div>

      <div className="flex-1" />

      {/* Right: actions */}
      <div className="flex items-center pr-2 gap-1">
        {/* Zoom controls */}
        <div className="flex items-center gap-0.5">
          <IconButton
            tooltip="Zoom out"
            shortcut="Cmd+-"
            tooltipSide="bottom"
            onClick={() => void window.api.zoomOut()}
          >
            <Minus size={14} />
          </IconButton>
          <span className="text-[10px] text-muted-foreground min-w-[3.5ch] text-center">
            {zoomPercent}%
          </span>
          <IconButton
            tooltip="Zoom in"
            shortcut="Cmd+="
            tooltipSide="bottom"
            onClick={() => void window.api.zoomIn()}
          >
            <Plus size={14} />
          </IconButton>
          {zoomLevel !== 0 && (
            <IconButton
              tooltip="Reset to 100%"
              shortcut="Cmd+0"
              tooltipSide="bottom"
              onClick={() => void window.api.zoomReset()}
            >
              <RotateCcw size={12} />
            </IconButton>
          )}
        </div>

        <div className="w-px h-4 bg-border mx-0.5" />

        <ThemeSwitcher size={14} side="bottom" />

        <div className="w-px h-4 bg-border mx-0.5" />

        {import.meta.env.DEV && (
          <IconButton
            tooltip="Debug Panel"
            tooltipSide="bottom"
            onClick={() => void api.openDebugPanel()}
          >
            <Bug size={14} />
          </IconButton>
        )}
        <IconButton
          tooltip="Reload Window"
          tooltipSide="bottom"
          onClick={() => window.location.reload()}
        >
          <RotateCw size={14} />
        </IconButton>
      </div>
    </div>
  );
}
