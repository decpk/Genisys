export interface ResizablePanelProps {
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  /**
   * Fires whenever the user resizes the panel via the drag handle. Use
   * to persist width to a store. Not called when only `defaultWidth`
   * changes externally.
   */
  onWidthChange?: (width: number) => void;
  position?: "left" | "right";
  as?: React.ElementType;
  className?: string;
  expandTitle?: string;
  collapseTitle?: string;
  children: React.ReactNode;
}
