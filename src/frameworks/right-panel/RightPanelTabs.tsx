import { Tabs, TabsList, TabsTrigger } from "./Tabs";

import { InstanceIdProvider } from "./InstanceIdContext";
import { PanelRenderer } from "./PanelRenderer";
import type { PanelDef, RightPanelTabsProps } from "./RightPanelTabs.types";
import { useRightPanelTabsData } from "./useRightPanelTabsData";

/**
 * Renders a single tab trigger. Lives in its own component so we can safely
 * invoke `panel.useIndicator` (a React hook) per tab without violating the
 * rules of hooks.
 */
function PanelTabTrigger({ panel }: { panel: PanelDef }) {
  const indicator = panel.useIndicator ? panel.useIndicator() : null;
  return (
    <TabsTrigger
      value={panel.id}
      icon={<panel.icon size={14} />}
      indicator={indicator}
    >
      {panel.label}
    </TabsTrigger>
  );
}

export function RightPanelTabs(
  props: RightPanelTabsProps,
): React.JSX.Element | null {
  const { panels, className, wrapper: SharedWrapper, instanceId } = props;
  const { currentTab, handleTabChange } = useRightPanelTabsData(props);

  const rootClassName = className ?? "flex flex-col h-full overflow-hidden";

  if (panels.length === 0) return null;

  // Single panel — render directly, no tab bar
  if (panels.length === 1) {
    const panel = panels[0];
    const content = (
      <div className={rootClassName}>
        <PanelRenderer panel={panel} isActive />
      </div>
    );

    const wrapped = SharedWrapper
      ? <SharedWrapper>{content}</SharedWrapper>
      : content

    return (
      <InstanceIdProvider instanceId={instanceId}>
        {wrapped}
      </InstanceIdProvider>
    );
  }

  // Multiple panels — tabbed interface
  const panelContent = (
    <Tabs
      value={currentTab}
      onValueChange={handleTabChange}
      className={rootClassName}
    >
      <TabsList className="shrink-0">
        {panels.map((panel) => (
          <PanelTabTrigger key={panel.id} panel={panel} />
        ))}
      </TabsList>

      <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-y-auto mt-2">
        {panels.map((panel) => (
          <PanelRenderer
            key={panel.id}
            panel={panel}
            isActive={currentTab === panel.id}
          />
        ))}
      </div>
    </Tabs>
  );

  const wrappedContent = SharedWrapper
    ? <SharedWrapper>{panelContent}</SharedWrapper>
    : panelContent

  return (
    <InstanceIdProvider instanceId={instanceId}>
      {wrappedContent}
    </InstanceIdProvider>
  );
}
