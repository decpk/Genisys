import { Lightbulb } from "lucide-react";

import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import { activityBarLabelButtonClass } from "../../ActivityBar.constants";

interface FeatureRequestActionProps {
  tooltipSide: "top" | "bottom" | "left" | "right";
  onActivate: () => void;
  isActive?: boolean;
  showLabel?: boolean;
  labelLeftAlign?: boolean;
}

export function FeatureRequestAction({
  tooltipSide,
  onActivate,
  isActive = false,
  showLabel = false,
  labelLeftAlign = false,
}: FeatureRequestActionProps): React.JSX.Element {
  if (showLabel) {
    return (
      <button
        type="button"
        className={activityBarLabelButtonClass(labelLeftAlign, isActive)}
        onClick={onActivate}
      >
        <Lightbulb size={20} />
        <span className="text-sm font-medium">Feature</span>
      </button>
    );
  }

  return (
    <IconButton
      tooltip="Request a Feature"
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
      <Lightbulb size={20} />
    </IconButton>
  );
}
