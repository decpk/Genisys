import { Suspense, lazy, useCallback, useEffect } from "react";

import { ActivityBar } from "@/components/ActivityBar";
import type { AppView } from "@/components/ActivityBar";
import { AppLoader } from "@/components/AppLoader";
import { setShortcutScopeOverride } from "@/frameworks/keyboard-shortcut/scopeOverride";
import { AppToaster } from "@/components/AppToaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ExplainSelection } from "@/components/ExplainSelection";
import { LockScreen } from "@/components/LockScreen";
import { Onboarding } from "@/components/Onboarding";
import { VoiceInputProvider } from "@/components/VoiceInput";
import { TextToSpeechProvider } from "@/components/TextToSpeech";
import {
  AppSwitcherHUD,
  useAppSwitcherHotkeys,
} from "@/frameworks/app-switcher";
import { useSecurityLock } from "@/hooks/useSecurityLock";
import {
  Dashboard,
  Settings,
  Autoflow,
  Webpoint,
  Chat,
  ProjectExplorer,
  Library,
  DebugPanel,
  DailyPlan,
  Timer,
  NotesApp,
  APIClient,
  WebLinks,
  MockServer,
  ClipboardManager,
  AppStore,
  PromptsApp,
  Messages,
  TerminalApp,
  Monitor,
  QuickShare,
  StoreInspector,
  AIInspector,
} from "@/App.constants";

import { useTimerTick } from "@/components/Timer/hooks/useTimerTick";
import { useTimerTrayEvents } from "@/components/Timer/hooks/useTimerTrayEvents";
import { useDailyPlanReminders } from "@/components/DailyPlan/hooks/useDailyPlanReminders";

import { useUsageTracker } from "./hooks/useUsageTracker";
import { useDisabledAppCleanup } from "./hooks/useDisabledAppCleanup";
import { GenisysMainContent } from "./components/GenisysMainContent";
import { GenisysLayout } from "./components/GenisysLayout";import { useGenisysApp } from "./hooks/useGenisysApp";
import { useOnboardingVisible } from "./hooks/useOnboardingVisible";
import { useShowCurrentWindowOnMount } from "./hooks/useShowCurrentWindowOnMount";

const CommandPalette = lazy(() =>
  import("@/components/CommandPalette").then((m) => ({ default: m.CommandPalette })),
);

const FullscreenClock = lazy(() =>
  import("@/components/FullscreenClock").then((m) => ({ default: m.FullscreenClock })),
);

const STANDALONE_COMPONENTS: Record<
  AppView,
  React.LazyExoticComponent<React.ComponentType>
> = {
  dashboard: Dashboard,
  explorer: ProjectExplorer,
  autoflow: Autoflow,
  webpoint: Webpoint,
  chat: Chat,
  messages: Messages,
  library: Library,
  settings: Settings,
  storeinspector: StoreInspector,
  debug: DebugPanel,
  aiinspector: AIInspector,
  dailyplan: DailyPlan,
  timer: Timer,
  notes: NotesApp,
  prompts: PromptsApp,
  apiclient: APIClient,
  weblinks: WebLinks,
  mockserver: MockServer,
  clipboard: ClipboardManager,
  terminal: TerminalApp,
  monitor: Monitor,
  quickshare: QuickShare,
  appstore: AppStore,
};

export function GenisysApp({
  initialApp,
  standalone,
}: {
  initialApp?: AppView;
  standalone?: boolean;
} = {}): React.JSX.Element {
  const {
    activeApp,
    setActiveApp,
    activated,
    deactivateApp,
    activityBarPosition,
  } = useGenisysApp();

  const { isLocked, attemptUnlock } = useSecurityLock()
  const showOnboarding = useOnboardingVisible();
  useUsageTracker();
  useTimerTick();
  useDailyPlanReminders();
  useTimerTrayEvents();
  useDisabledAppCleanup();
  useAppSwitcherHotkeys(setActiveApp);

  // Stable callback so `memo` on GenisysMainContent doesn't bust on every
  // render of GenisysApp (otherwise React.lazy section components in the
  // Settings drawer cause the active app's <Suspense> to flash).
  const handleOpenSettingsApp = useCallback(() => {
    setActiveApp('settings')
  }, [setActiveApp])
  // No-op in main window; in standalone (detached) windows this reveals the
  // window after React mounts so the user never sees the boot flash.
  useShowCurrentWindowOnMount();

  // Standalone windows render a single fixed app, but `settings-store.lastActiveApp`
  // reflects the MAIN window's last app (shared/persisted). Install a per-window
  // scope override so keyboard shortcuts + panel toggles target this window's app.
  const standaloneScope = standalone && initialApp ? initialApp : null;
  useEffect(() => {
    if (!standaloneScope) return;
    setShortcutScopeOverride(standaloneScope);
    return () => setShortcutScopeOverride(null);
  }, [standaloneScope]);

  // Standalone mode: render only the requested app, full-bleed (no ActivityBar).
  if (standalone && initialApp) {
    const StandaloneComponent = STANDALONE_COMPONENTS[initialApp];
    return (
      <VoiceInputProvider>
        <TextToSpeechProvider>
          <div className="flex flex-col h-screen w-screen bg-background text-foreground overflow-hidden">
            <AppToaster />
            <ExplainSelection />
            <Suspense fallback={null}>
              <CommandPalette />
            </Suspense>
            <Suspense fallback={null}>
              <FullscreenClock />
            </Suspense>
            <div className="flex-1 min-w-0 min-h-0 overflow-hidden">
              <Suspense fallback={<AppLoader />}>
                <ErrorBoundary componentName={initialApp}>
                  <StandaloneComponent />
                </ErrorBoundary>
              </Suspense>
            </div>
          </div>
        </TextToSpeechProvider>
      </VoiceInputProvider>
    );
  }

  // When locked, render ONLY the lock screen — app content is not in the DOM at all
  if (isLocked) {
    return <LockScreen attemptUnlock={attemptUnlock} />;
  }
  // Show onboarding overlay on first launch (or when re-triggered from Settings)
  if (showOnboarding) {
    return <Onboarding />
  }
  return (
    <VoiceInputProvider>
    <TextToSpeechProvider>
      <AppToaster />
      <ExplainSelection />
      <Suspense fallback={null}>
        <CommandPalette />
      </Suspense>
      <Suspense fallback={null}>
        <FullscreenClock />
      </Suspense>
      <AppSwitcherHUD onCommit={setActiveApp} onCloseApp={deactivateApp} />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <GenisysLayout
          activityBarPosition={activityBarPosition}
          activityBarEl={
            <ActivityBar
              activeApp={activeApp}
              onActiveAppChange={setActiveApp}
              activated={activated}
              onDeactivateApp={deactivateApp}
            />
          }
          mainContentEl={
            <GenisysMainContent
              activeApp={activeApp}
              activated={activated}
              onOpenSettingsApp={handleOpenSettingsApp}
            />
          }
        />
      </div>
    </TextToSpeechProvider>
    </VoiceInputProvider>
  );
}
