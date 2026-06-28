import type { AppView } from "@/components/ActivityBar";

/**
 * Apps that mount the AIAssistantPanel (or are AI-first like `chat`).
 * Only when the initial active app is one of these do we auto-connect MCP
 * servers on startup, to avoid paying that cost for non-AI apps.
 */
export const APPS_WITH_AI_ASSISTANT: ReadonlySet<AppView> = new Set<AppView>([
  "chat",
  "notes",
  "clipboard",
  "dailyplan",
  "library",
  "apiclient",
]);

export function shouldAutoConnectMcp(app: AppView): boolean {
  return APPS_WITH_AI_ASSISTANT.has(app);
}

export async function connectAllMcpServers(): Promise<void> {
  try {
    const result = await window.api.mcpConnectAll();
    console.log("[MCP] Auto-connect result:", result);
  } catch (err) {
    console.warn("[MCP] Auto-connect failed:", err);
  }
}
