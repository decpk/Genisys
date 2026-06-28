import { cn } from "../../utils";
import type { TabsListProps } from "./TabsList.types";
import { useTabsListData } from "./useTabsListData";

export function TabsList({ className, children, ...props }: TabsListProps) {
  const { listRef, indicator } = useTabsListData();

  return (
    <div
      data-slot="tabs-list"
      ref={listRef}
      className={cn(
        "relative inline-flex w-fit mx-auto mt-2 items-center overflow-hidden rounded-full p-0.75 gap-0.5 h-fit text-muted-foreground bg-muted/90",
        className,
      )}
      {...props}
    >
      {children}
      <span
        className="absolute bg-primary/15 ring-1 ring-primary/30 rounded-full shadow-sm transition-all duration-300 ease-out"
        style={{
          left: indicator.left,
          top: indicator.top,
          width: indicator.width,
          height: indicator.height,
          opacity: indicator.opacity,
        }}
      />
    </div>
  );
}
