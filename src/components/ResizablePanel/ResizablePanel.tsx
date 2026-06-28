import { useResizablePanel } from './hooks/useResizablePanel'
import type { ResizablePanelProps } from './ResizablePanel.types'

export function ResizablePanel({
  minWidth = 200,
  maxWidth = 600,
  defaultWidth = 256,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapseChange,
  onWidthChange,
  position = "left",
  as: Tag = "div",
  className = "",
  expandTitle = "Expand panel",
  children,
}: ResizablePanelProps) {
  const isRight = position === "right";
  const {
    width,
    collapsed,
    handleResizeMouseDown,
    handleExpandMouseDown,
    toggleCollapse,
  } = useResizablePanel({
    minWidth,
    maxWidth,
    defaultWidth,
    collapsed: controlledCollapsed,
    defaultCollapsed,
    onCollapseChange,
    onWidthChange,
    direction: isRight ? "left" : "right",
  });

  const borderSide = isRight ? "border-l" : "border-r";
  const edgePos = isRight
    ? "left-0 -translate-x-1/2"
    : "right-0 translate-x-1/2";

  if (collapsed) {
    return (
      <Tag className={`relative shrink-0 w-[2px] z-10 ${className}`}>
        {/* Thin edge zone — click or drag outward to expand */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[6px] h-full z-20 cursor-col-resize group"
          onMouseDown={handleExpandMouseDown}
          onClick={(e) => {
            e.stopPropagation();
            toggleCollapse();
          }}
          title={expandTitle}
        >
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
      </Tag>
    );
  }

  return (
    <Tag
      className={`relative shrink-0 z-10 ${borderSide} border-border/40 flex flex-col ${className}`}
      style={{ width }}
    >
      <div className="flex-1 flex flex-col overflow-y-auto">{children}</div>

      {/* Edge zone — centered on the panel border, drag to resize */}
      <div
        className={`absolute top-0 ${edgePos} w-[6px] h-full z-20 cursor-col-resize group`}
        onMouseDown={handleResizeMouseDown}
      >
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    </Tag>
  );
}
