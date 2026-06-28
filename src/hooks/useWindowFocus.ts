import { useSyncExternalStore } from "react";

// Module-level shared state for window focus
let focused = true;
const listeners = new Set<() => void>();

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): boolean {
  return focused;
}

function setFocused(value: boolean): void {
  if (focused === value) return;
  focused = value;
  listeners.forEach((cb) => cb());
}

// Initialize Tauri focus listeners once
let initialized = false;
let tauriUnlistenFocus: (() => void) | null = null;
let tauriUnlistenBlur: (() => void) | null = null;
let fallbackCleanup: (() => void) | null = null;

function initTauriFocusListeners(): void {
  if (initialized) return;
  initialized = true;

  import("@tauri-apps/api/window")
    .then(({ getCurrentWindow }) => {
      const win = getCurrentWindow();
      // Set initial state
      win.isFocused().then((isFocused) => setFocused(isFocused));
      // Listen for focus/blur events; capture unlisten functions so they
      // can be cleaned up on HMR (and never silently leak in production).
      win.listen("tauri://focus", () => setFocused(true)).then((u) => {
        tauriUnlistenFocus = u;
      });
      win.listen("tauri://blur", () => setFocused(false)).then((u) => {
        tauriUnlistenBlur = u;
      });
    })
    .catch(() => {
      // Fallback to browser visibility API if Tauri is not available
      const handleVisibility = (): void =>
        setFocused(document.visibilityState === "visible");
      document.addEventListener("visibilitychange", handleVisibility);
      fallbackCleanup = () =>
        document.removeEventListener("visibilitychange", handleVisibility);
    });
}

initTauriFocusListeners();

// HMR teardown: prevents duplicate listener accumulation across dev reloads.
// No-op in production builds (import.meta.hot is undefined).
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    tauriUnlistenFocus?.();
    tauriUnlistenBlur?.();
    fallbackCleanup?.();
    tauriUnlistenFocus = null;
    tauriUnlistenBlur = null;
    fallbackCleanup = null;
    initialized = false;
  });
}

export function useWindowFocus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Non-hook version for use outside React components */
export function isWindowFocused(): boolean {
  return focused;
}

/**
 * Imperative subscription to focus changes for non-render consumers (e.g.
 * background trackers). Unlike {@link useWindowFocus}, this does NOT trigger a
 * React re-render — the callback fires on every focus/blur. Returns an
 * unsubscribe function.
 */
export function subscribeWindowFocus(cb: () => void): () => void {
  return subscribe(cb);
}
