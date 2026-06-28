import type { ExplorerShortcutKey } from "@/store/explorer-shortcut-keys";
import type { ExplorerShortcutMeta } from "../ExplorerShortcutsSetting.types";

export interface ExplorerShortcutRowProps {
  meta: ExplorerShortcutMeta;
  visible: boolean;
  onToggle: (key: ExplorerShortcutKey, visible: boolean) => void;
}
