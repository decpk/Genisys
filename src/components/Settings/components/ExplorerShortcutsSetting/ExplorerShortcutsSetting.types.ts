import type { LucideIcon } from "lucide-react";
import type { ExplorerShortcutKey } from "@/store/explorer-shortcut-keys";

export interface ExplorerShortcutMeta {
  key: ExplorerShortcutKey;
  label: string;
  description: string;
  icon: LucideIcon;
}
