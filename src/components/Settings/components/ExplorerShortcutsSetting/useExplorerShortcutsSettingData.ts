import { useSettingsStore } from "@/store/settings-store";

export function useExplorerShortcutsSettingData() {
  const visibility = useSettingsStore((s) => s.explorerShortcutVisibility);
  const setVisibility = useSettingsStore(
    (s) => s.setExplorerShortcutVisibility,
  );
  return { visibility, setVisibility };
}
