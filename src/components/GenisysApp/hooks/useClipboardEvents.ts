import { useEffect, useRef } from "react";

import { useClipboardStore } from "@/store/clipboard-store";
import { useSettingsStore } from "@/store/settings-store";
import { resolveClipboardVisionModel } from "@/lib/resolveAppModel";

/**
 * App-level clipboard event subscriptions.
 *
 * Hoisted out of `useClipboardManagerData` so that auto image-analysis and
 * store updates fire regardless of whether the Clipboard app has been
 * mounted in the current session. The Clipboard app is lazy-mounted (only
 * after the user first navigates to it), so without this hook a screenshot
 * captured while in another app would be saved by the Rust backend but
 * never analyzed by AI.
 */
export function useClipboardEvents(): void {
  const prependItem = useClipboardStore((s) => s.prependItem);
  const loadStats = useClipboardStore((s) => s.loadStats);
  const updateItemAnalysis = useClipboardStore((s) => s.updateItemAnalysis);
  const moveItemToTop = useClipboardStore((s) => s.moveItemToTop);
  const settingsLoaded = useSettingsStore((s) => s.isLoaded);
  const clipboardEnabled = useSettingsStore((s) => s.isAppEnabled("clipboard"));

  // Trailing-debounce timer for stats reconciliation. `prependItem` already
  // updates stats optimistically per copy, so a full `loadStats()` reload is
  // deferred and coalesced (1s) instead of firing on every clipboard event.
  const statsReloadTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  // Listen for new clipboard items from the Tauri backend.
  useEffect(() => {
    const unlisten = window.api.onClipboardNewItem((item: any) => {
      // The Rust monitor is the authoritative gate, but guard here too in case
      // a copy races the disable toggle: a disabled Clipboard app must never
      // ingest new items.
      if (!useSettingsStore.getState().isAppEnabled("clipboard")) return;
      // `prependItem` already updates stats optimistically. Skip the
      // per-copy full backend reload and instead reconcile on a trailing
      // 1s debounce so bursts of copies (and backend LRU pruning) still
      // converge to accurate stats without a round-trip on every event.
      prependItem(item);
      if (statsReloadTimer.current) clearTimeout(statsReloadTimer.current);
      statsReloadTimer.current = setTimeout(() => {
        loadStats();
      }, 1000);

      // Auto-analyze image if the setting is enabled.
      if (item.contentType === "image" && item.imagePath) {
        const autoDescribe =
          useSettingsStore.getState().clipboardAutoDescribeImages;
        if (autoDescribe) {
          updateItemAnalysis(item.id, null, "pending");
          window.api.analyzeClipboardImage(item.id, item.imagePath, resolveClipboardVisionModel());
        }
      }
    });
    return () => {
      unlisten();
      if (statsReloadTimer.current) clearTimeout(statsReloadTimer.current);
    };
  }, [prependItem, loadStats, updateItemAnalysis]);

  // Listen for image analysis completion.
  useEffect(() => {
    const unlisten = window.api.onClipboardImageAnalyzed((data: any) => {
      updateItemAnalysis(
        data.itemId,
        data.description ?? null,
        data.analysisStatus,
        data.extractedText ?? null,
      );
    });
    return () => {
      unlisten();
    };
  }, [updateItemAnalysis]);

  // Listen for clipboard item moved to top (add-once dedup).
  useEffect(() => {
    const unlisten = window.api.onClipboardItemMoved((item: any) => {
      moveItemToTop(item);
    });
    return () => {
      unlisten();
    };
  }, [moveItemToTop]);

  // Sync clipboard settings to the backend after settings finish loading
  // from disk so the backend uses the user's saved values (not its hard-coded
  // defaults). Without this, the Rust monitor stays on its default
  // `max_items = 500` until the user manually re-selects the setting,
  // causing the DB to be pruned to 500 on every new copy even when the
  // user has chosen 1000+.
  useEffect(() => {
    if (!settingsLoaded) return;
    const { clipboardAddOnce, clipboardMaxItems } = useSettingsStore.getState();
    window.api?.setClipboardAddOnce?.(clipboardAddOnce);
    window.api?.setClipboardMaxItems?.(clipboardMaxItems);
  }, [settingsLoaded]);

  // Drive the Rust clipboard monitor on/off with the Clipboard app's enabled
  // state. A disabled Clipboard app must not read or store anything the user
  // copies; existing history is preserved and capture resumes on re-enable.
  useEffect(() => {
    if (!settingsLoaded) return;
    window.api?.setClipboardEnabled?.(clipboardEnabled);
  }, [settingsLoaded, clipboardEnabled]);
}
