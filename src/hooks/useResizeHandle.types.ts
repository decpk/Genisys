export interface UseResizeHandleOptions {
  /** Current width of the panel */
  width: number;
  /** Minimum allowed width */
  minWidth: number;
  /** Maximum allowed width */
  maxWidth: number;
  /** Width to reset to on double-click (typically the default width) */
  resetWidth: number;
  /** Resize direction — 'left'/'right' for horizontal, 'up'/'down' for vertical */
  direction?: "left" | "right" | "up" | "down";
  /** Callback when width changes during drag or double-click reset */
  onWidthChange: (width: number) => void;
  /** If raw width drops below this threshold during drag, trigger onCollapse */
  collapseThreshold?: number;
  /** Called when drag crosses below the collapse threshold */
  onCollapse?: () => void;
  /** Called when drag crosses back above the collapse threshold (with clamped width) */
  onExpand?: (width: number) => void;
}
