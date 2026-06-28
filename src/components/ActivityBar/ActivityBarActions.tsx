import { DevToolsAction } from "./actions/DevToolsAction";

import type { AppView } from "./ActivityBar.types";

interface ActivityBarActionsProps {
  tooltipSide: "top" | "bottom" | "left" | "right";
  isHorizontal: boolean;
  activeApp: AppView;
  onActiveAppChange: (mode: AppView) => void;
  showLabel?: boolean;
  labelLeftAlign?: boolean;
}

export function ActivityBarActions({
  tooltipSide,
  activeApp,
  onActiveAppChange,
  showLabel = false,
  labelLeftAlign = false,
}: ActivityBarActionsProps): React.JSX.Element {
  return (
    <>
      <DevToolsAction
        tooltipSide={tooltipSide}
        onActivate={() => onActiveAppChange("debug")}
        isActive={activeApp === "debug"}
        showLabel={showLabel}
        labelLeftAlign={labelLeftAlign}
      />
    </>
  );
}
