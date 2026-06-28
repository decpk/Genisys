import * as React from 'react'

import type { TabsContextValue } from "./Tabs.types";

const TabsContext = React.createContext<TabsContextValue | null>(null)

export function useTabs(): TabsContextValue {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error('Tabs components must be used within <Tabs>')
  return ctx
}

export function useTabsData(
  value: string,
  onValueChange: (value: string) => void,
) {
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const [iconsOnly, setIconsOnly] = React.useState(false);

  const registerTab = React.useCallback(
    (val: string, el: HTMLButtonElement | null) => {
      void val;
      void el;
    },
    [],
  );

  const contextValue: TabsContextValue = React.useMemo(
    () => ({ value, onValueChange, registerTab, listRef, iconsOnly }),
    [value, onValueChange, registerTab, iconsOnly],
  );

  return { contextValue, listRef, iconsOnly, setIconsOnly };
}

export { TabsContext }
