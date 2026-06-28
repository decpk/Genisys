import { cn } from "../../utils";
import { Tooltip } from "../../../../components/Tooltip";
import { hasVisibleIndicator } from "./hasVisibleIndicator";
import { PanelIndicatorBadge } from "./PanelIndicatorBadge";
import type { TabsTriggerProps } from "./TabsTrigger.types";
import { useTabsTriggerData } from "./useTabsTriggerData";

export function TabsTrigger({
  value,
  className,
  icon,
  indicator,
  children,
  ...props
}: TabsTriggerProps) {
  const { isActive, showIconOnly, ref, handleClick, dataState } =
    useTabsTriggerData(value);

  const shouldShowIconOnly = showIconOnly && !!icon;
  const paddingClass = shouldShowIconOnly ? "px-3.5" : "px-3";
  const gapClass = icon && !shouldShowIconOnly ? "gap-1.5" : "";
  const showIndicator = hasVisibleIndicator(indicator);
  // Key the badge by its current value so the appear-spring re-plays as a
  // calm "bump" whenever the count changes — Apple-style, no infinite pulse.
  const indicatorKey = showIndicator
    ? indicator.kind === 'count'
      ? `count-${indicator.count}`
      : 'dot'
    : null;

  const button = (
    <button
      ref={ref}
      data-slot="tabs-trigger"
      data-state={dataState}
      onClick={handleClick}
      className={cn(
        "relative inline-flex items-center justify-center whitespace-nowrap text-xs font-medium transition-colors duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
        "z-10 rounded-full py-1.5 flex-1",
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
        paddingClass,
        gapClass,
        className,
      )}
      {...props}
    >
      {icon}
      {!shouldShowIconOnly && children}
      {showIndicator && !shouldShowIconOnly && (
        <PanelIndicatorBadge key={indicatorKey ?? undefined} indicator={indicator} mode="inline" />
      )}
      {showIndicator && shouldShowIconOnly && (
        <PanelIndicatorBadge key={indicatorKey ?? undefined} indicator={indicator} mode="overlay" />
      )}
    </button>
  );

  const tooltipContent =
    showIndicator && indicator.tooltip ? (
      <span>
        {children}
        <span className="opacity-70"> — {indicator.tooltip}</span>
      </span>
    ) : (
      children
    );

  if (shouldShowIconOnly) {
    return (
      <Tooltip content={tooltipContent} side="bottom">
        {button}
      </Tooltip>
    );
  }

  // Wrap with tooltip when a meaningful indicator tooltip exists, so users
  // can hover the tab to learn what the badge represents.
  if (showIndicator && indicator.tooltip) {
    return (
      <Tooltip content={indicator.tooltip} side="bottom">
        {button}
      </Tooltip>
    );
  }

  return button;
}
