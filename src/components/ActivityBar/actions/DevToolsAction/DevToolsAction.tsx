import { Hammer } from "lucide-react";

import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import { useDevToolsVisible } from "../../useDevToolsVisible";
import { activityBarLabelButtonClass } from "../../ActivityBar.constants";

interface DevToolsActionProps {
  tooltipSide: "top" | "bottom" | "left" | "right";
  onActivate: () => void;
  isActive?: boolean;
  showLabel?: boolean;
  labelLeftAlign?: boolean;
}

export function DevToolsAction({
  tooltipSide,
  onActivate,
  isActive = false,
  showLabel = false,
  labelLeftAlign = false,
}: DevToolsActionProps): React.JSX.Element | null {
  const devToolsVisible = useDevToolsVisible();
  const isDev = import.meta.env.DEV;
  const show = isDev ? devToolsVisible : true;
  if (!show) return null;

  if (showLabel) {
    return (
      <button
        type="button"
        className={activityBarLabelButtonClass(labelLeftAlign, isActive)}
        onClick={onActivate}
      >
        <Hammer size={20} />
        <span className="text-sm font-medium">Tools & Feedback</span>
      </button>
    );
  }

  return (
    <IconButton
      tooltip="Tools & Feedback"
      tooltipSide={tooltipSide}
      size="lg"
      onClick={onActivate}
      className={cn(
        "border border-transparent",
        isActive
          ? "bg-primary/15 text-primary border-primary/50 shadow-sm hover:bg-primary/20 hover:text-primary"
          : "text-muted-foreground/55 hover:text-foreground/80",
      )}
    >
      <Hammer size={20} />
    </IconButton>
  );
}
