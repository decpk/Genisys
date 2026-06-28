import { Suspense, useEffect } from "react";

import { AppLoader } from "@/components/AppLoader";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ContentShareProvider } from "@/components/ContentShare";
import { GenisysApp } from "@/components/GenisysApp";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { QuitConfirmModal } from "@/components/QuitConfirmModal";
import { ShortcutDispatcher } from "@/frameworks/keyboard-shortcut";
import { useKeyboardShortcutImpl } from "@/keyboard-shortcut-impl";
import { TimerFocusMiniApp } from "@/components/Timer/components/TimerFocusMiniApp";
import {
  DebugPanelApp,
} from "@/App.constants";
import {
  isDebugPanelMode,
  getStandaloneAppParam,
  isTimerFocusMiniMode,
} from "@/App.utils";

export function App(): React.JSX.Element {
  useKeyboardShortcutImpl();
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      if (e.key === "=" || e.key === "+") {
        e.preventDefault();
        window.api.zoomIn();
      } else if (e.key === "-") {
        e.preventDefault();
        window.api.zoomOut();
      } else if (e.key === "0") {
        e.preventDefault();
        window.api.zoomReset();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const isDebugMode = isDebugPanelMode();
  const standaloneApp = getStandaloneAppParam();
  const isFocusMini = isTimerFocusMiniMode();

  if (isFocusMini) {
    return (
      <div className="h-screen w-screen bg-transparent">
        <ErrorBoundary componentName="Timer Focus">
          <TimerFocusMiniApp />
        </ErrorBoundary>
      </div>
    );
  }

  if (standaloneApp) {
    return (
      <div className="flex flex-col h-screen">
        <ShortcutDispatcher />
        <Suspense fallback={<AppLoader />}>
          <ErrorBoundary componentName="Genisys">
            <GenisysApp initialApp={standaloneApp as any} standalone />
          </ErrorBoundary>
        </Suspense>
        <ConfirmDialog />
      </div>
    );
  }

  if (isDebugMode) {
    return (
      <div className="flex flex-col h-screen">
        <ShortcutDispatcher />
        <Suspense fallback={<AppLoader />}>
          <ErrorBoundary componentName="Debug Panel">
            <DebugPanelApp />
          </ErrorBoundary>
        </Suspense>
        <ConfirmDialog />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <ShortcutDispatcher />
      <Suspense fallback={<AppLoader />}>
        <ErrorBoundary componentName="Genisys">
          <GenisysApp />
        </ErrorBoundary>
      </Suspense>
      <ConfirmDialog />
      <QuitConfirmModal />
      <ContentShareProvider />
    </div>
  );
}
