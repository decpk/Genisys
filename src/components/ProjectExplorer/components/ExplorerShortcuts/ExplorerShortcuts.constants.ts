import {
  Home,
  Monitor,
  Download,
  FileText,
  LayoutGrid,
  Image as ImageIcon,
} from "lucide-react";
import type { ExplorerShortcutDescriptor } from "./ExplorerShortcuts.types";

/**
 * Stable display order for sidebar shortcuts. Mirrors `EXPLORER_SHORTCUT_KEYS`
 * from `src/store/explorer-shortcut-keys.ts` but carries UI metadata so the
 * component does not need to repeat icon/label logic.
 */
export const EXPLORER_SHORTCUT_DESCRIPTORS: ExplorerShortcutDescriptor[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "desktop", label: "Desktop", icon: Monitor },
  { key: "downloads", label: "Downloads", icon: Download },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "applications", label: "Applications", icon: LayoutGrid },
  { key: "pictures", label: "Pictures", icon: ImageIcon },
];
