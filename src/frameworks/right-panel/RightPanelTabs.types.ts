/**
 * Tone token for tab attention indicators. Maps to existing CSS color tokens
 * inside `TabsTrigger`. Keep this list small so the look stays consistent
 * across apps.
 */
export type PanelIndicatorTone = 'default' | 'accent' | 'warning' | 'danger'

/**
 * Attention indicator surfaced on a right-panel tab trigger. Use `dot` for a
 * presence hint and `count` when a concrete number is meaningful.
 *
 * A panel hook returning `null` / `undefined` (or `count: 0`) renders nothing.
 */
export type PanelIndicator =
  | {
      kind: 'dot'
      tone?: PanelIndicatorTone
      /** Extra text appended to the tab's tooltip when icon-only. */
      tooltip?: string
    }
  | {
      kind: 'count'
      count: number
      tone?: PanelIndicatorTone
      tooltip?: string
      /** Counts above this clamp to `${max}+`. Default 99. */
      max?: number
    }

export interface PanelDef {
  /** Unique identifier, used as the tab value */
  id: string
  /** Display label shown in the tab */
  label: string
  /** Icon component rendered in the tab trigger */
  icon: React.ComponentType<{ size?: number }>
  /** The panel content component */
  component: React.ComponentType
  /**
   * When true, the panel stays mounted (hidden via display:none) when inactive.
   * Use `usePanelActive()` inside the component to skip expensive work.
   * @default false — panel unmounts when inactive (zero re-renders)
   */
  keepAlive?: boolean
  /** Mark as the default active tab. First panel is used if none specified. */
  defaultTab?: boolean
  /**
   * Optional wrapper component for this panel (e.g., a data provider).
   * Receives `{ children }` and wraps the panel component.
   */
  wrapper?: React.ComponentType<{ children: React.ReactNode }>
  /**
   * Optional React hook invoked inside the tab trigger to compute an
   * attention indicator (dot or numeric badge). Hook runs even when the tab
   * is inactive, so it can advertise pending data/actions (e.g., unstaged
   * git changes). Must follow the rules of hooks and stay cheap — prefer
   * subscriptions over polling.
   */
  useIndicator?: () => PanelIndicator | null | undefined
}

export interface RightPanelTabsProps {
  /** Array of panel definitions to render */
  panels: PanelDef[];
  /** Controlled active tab id */
  activeTab?: string;
  /** Callback when active tab changes */
  onTabChange?: (tabId: string) => void;
  /** Additional CSS class for the root container */
  className?: string;
  /**
   * Shared wrapper for ALL panels (e.g., event bus provider, shared context).
   * Applied around the entire panel rendering area.
   */
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
  /**
   * Unique instance identifier for this RightPanelTabs.
   * Enables multiple panel groups to coexist without data leaking.
   * Auto-generated if not provided.
   */
  instanceId?: string;
}
