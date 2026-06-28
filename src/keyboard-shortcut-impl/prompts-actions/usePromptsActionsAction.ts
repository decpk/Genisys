import { useBindShortcutActions } from "@/frameworks/keyboard-shortcut";
import { usePromptsAppTabsStore } from "@/store/prompts-app-tabs-store";

export function usePromptsActionsAction(): void {
  useBindShortcutActions({
    "prompts.closeTab": () => {
      const { activePromptTabId, closePromptTab } =
        usePromptsAppTabsStore.getState();
      if (activePromptTabId) closePromptTab(activePromptTabId);
    },
  });
}
