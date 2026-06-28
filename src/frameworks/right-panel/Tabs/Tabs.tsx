import { cn } from '../utils'
import { TabsContext, useTabsData } from './useTabsData'
import { IconsOnlyDetector } from './IconsOnlyDetector'
import type { TabsProps } from './Tabs.types'

export function Tabs({
  value,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  const { contextValue, listRef, iconsOnly, setIconsOnly } = useTabsData(
    value,
    onValueChange,
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <IconsOnlyDetector
        listRef={listRef}
        onToggle={setIconsOnly}
        iconsOnly={iconsOnly}
      >
        <div
          data-slot="tabs"
          className={cn("flex flex-col", className)}
          {...props}
        >
          {children}
        </div>
      </IconsOnlyDetector>
    </TabsContext.Provider>
  );
}
