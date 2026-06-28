import { Suspense, memo } from "react";

import { AppLoader, AppShellLoader } from "@/components/AppLoader";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import type { AppView } from "@/components/ActivityBar";

// Use opacity:0 + absolute positioning instead of display:none to preserve
// layout dimensions of inactive apps (prevents Monaco editors and flex
// containers from collapsing to 0×0 when hidden). We use opacity:0 rather
// than visibility:hidden because Monaco internally sets visibility:visible on
// child elements (cursors, widgets, scrollbars), which overrides the parent's
// visibility:hidden and causes the editor to bleed through to other tabs.
//
// `inert` is what actually neutralizes the hidden pane: because every keep-alive
// app is `position:absolute inset-0`, the inactive panes paint *on top of* the
// in-flow active pane in stacking order. `pointer-events:none` alone is not
// enough — it is inherited and gets overridden by the many descendants that set
// `pointer-events:auto` (tooltips, dropdowns, Monaco widgets, drop zones, etc.),
// which then swallow wheel/scroll/click events meant for the visible app. The
// `inert` attribute cannot be overridden by descendants and also removes the
// hidden subtree from focus/tab order, so keyboard scrolling targets the active
// app. The active pane additionally gets `relative z-10` so it always paints
// above the absolutely-positioned background panes (defense in depth).
//
// `content-visibility:hidden` makes the browser SKIP layout, paint, and style
// work for the inactive subtree entirely (the big snappiness win — hidden apps
// stop competing for the main thread while you interact with the active one).
// It is safe here: the pane keeps its box from `inset-0` (size containment does
// not collapse it), the rendered state is cached for instant re-show, and —
// unlike `visibility:hidden` — descendants (Monaco cursors/widgets) cannot
// override it to bleed through. The active pane omits it, so it renders fully.
const INACTIVE =
  "absolute inset-0 opacity-0 pointer-events-none [content-visibility:hidden]";

interface AppPaneProps {
  appId: AppView;
  activeApp: AppView;
  /** Class applied when this pane is the active app. */
  activeClassName: string;
  /** Name shown by the ErrorBoundary fallback. */
  componentName: string;
  /** Loader shown while the lazy app chunk is loading. */
  fallback?: "app" | "shell";
  children: React.ReactNode;
}

export const AppPane = memo(function AppPane({
  appId,
  activeApp,
  activeClassName,
  componentName,
  fallback = "shell",
  children,
}: AppPaneProps): React.JSX.Element {
  const isActive = activeApp === appId;

  return (
    <div
      data-app={appId}
      // `inert` is a boolean attribute; React 19 supports it natively.
      inert={!isActive}
      className={isActive ? `${activeClassName} relative z-10` : INACTIVE}
    >
      <Suspense fallback={fallback === "app" ? <AppLoader /> : <AppShellLoader />}>
        <ErrorBoundary componentName={componentName}>{children}</ErrorBoundary>
      </Suspense>
    </div>
  );
});
