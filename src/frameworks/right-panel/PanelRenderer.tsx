import { memo, Suspense } from "react";

import { AppLoader } from "@/components/AppLoader";

import { PanelActiveProvider } from "./PanelActiveContext";
import { useInstanceId } from "./InstanceIdContext";
import { PanelInstanceProvider } from "./PanelInstanceContext";
import type { PanelDef } from "./RightPanelTabs.types";

interface PanelRendererProps {
  panel: PanelDef;
  isActive: boolean;
}

/**
 * Decides how to show or hide a panel.
 *
 * - Disposable panel (default): removed entirely when not selected, created fresh when selected again.
 * - Persistent panel: stays alive in the background; simply hidden when not selected.
 *
 * Applies the panel's `wrapper` (if defined) around the component for data injection.
 * Provides `PanelInstanceProvider` so panels can access their id and instance context.
 */
export const PanelRenderer = memo(function PanelRenderer({
  panel,
  isActive,
}: PanelRendererProps) {
  const { component: Component, keepAlive = false, wrapper: Wrapper } = panel;
  const instanceId = useInstanceId();

  const isDisposable = !keepAlive;

  // Disposable panel that is not selected → remove it
  if (isDisposable && !isActive) return null;

  const inner = Wrapper ? (
    <Wrapper>
      <Component />
    </Wrapper>
  ) : (
    <Component />
  );

  const content = <Suspense fallback={<AppLoader />}>{inner}</Suspense>;

  // Disposable panel that is selected → show it
  if (isDisposable) {
    return (
      <PanelActiveProvider isActive>
        <PanelInstanceProvider
          panelId={panel.id}
          instanceId={instanceId}
          isActive
        >
          {content}
        </PanelInstanceProvider>
      </PanelActiveProvider>
    );
  }

  // Persistent panel → always alive, just hidden when not selected
  return (
    <PanelActiveProvider isActive={isActive}>
      <PanelInstanceProvider
        panelId={panel.id}
        instanceId={instanceId}
        isActive={isActive}
      >
        <div
          style={{ display: isActive ? undefined : "none" }}
          className="flex-1 min-h-0 flex flex-col"
        >
          {content}
        </div>
      </PanelInstanceProvider>
    </PanelActiveProvider>
  );
});
