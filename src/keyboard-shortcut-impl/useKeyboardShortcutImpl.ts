import { useApiClientActionsAction } from "./apiclient-actions";
import { useChatActionsAction } from "./chat-actions";
import { useClipboardActionsAction } from "./clipboard-actions";
import { useClockActionsAction } from "./clock-actions";
import { useCommandPaletteActions } from "./command-palette-actions";
import { useDailyPlanActionsAction } from "./dailyplan-actions";
import { useLibraryActionsAction, useNotesActionsAction } from "./library-actions";
import { useMockServerActionsAction } from "./mockserver-actions";
import { useTerminalActionsAction } from "./terminal-actions";
import { usePromptsActionsAction } from "./prompts-actions";
import { useSecurityActionsAction } from "./security-actions";
import { useTimerActionsAction } from "./timer-actions";
import { useToggleRightPanelAction } from "./toggle-right-panel";
import { useToggleSidebarAction } from "./toggle-sidebar";
import { useToggleActivityBarAction } from "./toggle-activity-bar";
import { useWindowActions } from "./window-actions";
import { useZoomActions } from "./zoom-actions";

export function useKeyboardShortcutImpl(): void {
  useToggleSidebarAction();
  useToggleRightPanelAction();
  useToggleActivityBarAction();
  useLibraryActionsAction();
  useNotesActionsAction();
  useApiClientActionsAction();
  useChatActionsAction();
  useClipboardActionsAction();
  useClockActionsAction();
  useDailyPlanActionsAction();
  useTimerActionsAction();
  useMockServerActionsAction();
  useTerminalActionsAction();
  usePromptsActionsAction();
  useSecurityActionsAction();
  useCommandPaletteActions();
  useZoomActions();
  useWindowActions();
}
