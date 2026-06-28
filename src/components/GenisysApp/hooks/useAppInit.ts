import { useEffect, useRef } from 'react'

import type { AppView } from '@/components/ActivityBar'
import { useExplorerHistoryStore } from '@/store/explorer-history-store'
import { useChatHistoryStore } from '@/store/chat-history-store'
import { useSnippetsStore } from '@/store/snippets-store'
import { useThemeStore } from '@/store/theme-store'
import { useSettingsStore } from '@/store/settings-store'
import { useSettingsDrawerStore } from '@/store/settings-drawer-store'
import { useKeyboardStore, shortcutRegistry, ALL_SHORTCUT_DEFS } from '@/frameworks/keyboard-shortcut'
import { useAutoThemeScheduler } from '@/themes/auto-scheduler'
import { useTimerStore } from '@/store/timer-store'
import {
  connectAllMcpServers,
  shouldAutoConnectMcp,
} from "./utils/connectAllMcpServers";
import { useClipboardEvents } from "./useClipboardEvents";

export function useAppInit(activeApp: AppView): void {
  const loadExplorerHistory = useExplorerHistoryStore((s) => s.loadHistory);
  const loadChatHistory = useChatHistoryStore((s) => s.loadConversations);
  const loadSnippets = useSnippetsStore((s) => s.loadSnippets);
  const initTheme = useThemeStore((s) => s.initTheme);
  const initSettings = useSettingsStore((s) => s.initSettings);
  const initKeyboardShortcuts = useKeyboardStore(
    (s) => s.initKeyboardShortcuts,
  );
  const isLoaded = useSettingsStore((s) => s.isLoaded);
  const hasCompletedOnboarding = useSettingsStore(
    (s) => s.hasCompletedOnboarding,
  );
  const mcpConnectedRef = useRef(false);

  useEffect(() => {
    initSettings();
    initTheme();
    initKeyboardShortcuts();
    shortcutRegistry.register(ALL_SHORTCUT_DEFS);
    useTimerStore.getState().hydrate();
    useSettingsDrawerStore.getState().initDrawer();
  }, [initSettings, initTheme, initKeyboardShortcuts]);

  useAutoThemeScheduler();

  // Subscribe to clipboard backend events at app level so auto image-analysis
  // works regardless of which app is currently active.
  useClipboardEvents();

  // Auto-connect all enabled MCP servers the first time the user lands on (or navigates to)
  // an app that uses the AI Assistant (e.g. chat). One-shot per session: avoids paying the MCP
  // startup cost when the user is only using non-AI apps. Manual connect via Settings/Chat
  // right panel still works regardless.
  useEffect(() => {
    if (!isLoaded || !hasCompletedOnboarding || mcpConnectedRef.current) return;
    if (!shouldAutoConnectMcp(activeApp)) return;
    mcpConnectedRef.current = true;
    connectAllMcpServers();
  }, [isLoaded, hasCompletedOnboarding, activeApp]);

  useEffect(() => {
    if (!isLoaded) return;
    if (activeApp === "explorer") loadExplorerHistory();
    if (activeApp === "chat") loadChatHistory();
    if (activeApp === "dashboard") {
      loadSnippets();
    }
  }, [
    isLoaded,
    activeApp,
    loadExplorerHistory,
    loadChatHistory,
    loadSnippets,
  ]);
}
