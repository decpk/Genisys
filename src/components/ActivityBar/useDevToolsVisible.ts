import { useSettingsStore } from "@/store/settings-store";

export function useDevToolsVisible(): boolean {
  return useSettingsStore((s) => s.devShowDebugTools);
}
