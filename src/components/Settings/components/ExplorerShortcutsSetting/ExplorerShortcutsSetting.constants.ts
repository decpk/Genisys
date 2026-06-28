import {
  Home,
  Monitor,
  Download,
  FileText,
  LayoutGrid,
  Image as ImageIcon,
} from "lucide-react";
import type { ExplorerShortcutMeta } from "./ExplorerShortcutsSetting.types";

export const EXPLORER_SHORTCUT_META: ExplorerShortcutMeta[] = [
  {
    key: "home",
    label: "Home",
    description: "Your user home directory.",
    icon: Home,
  },
  {
    key: "desktop",
    label: "Desktop",
    description: "Files on the desktop.",
    icon: Monitor,
  },
  {
    key: "downloads",
    label: "Downloads",
    description: "The default Downloads folder.",
    icon: Download,
  },
  {
    key: "documents",
    label: "Documents",
    description: "The default Documents folder.",
    icon: FileText,
  },
  {
    key: "applications",
    label: "Applications",
    description: "Installed applications (macOS only).",
    icon: LayoutGrid,
  },
  {
    key: "pictures",
    label: "Pictures",
    description: "The default Pictures folder.",
    icon: ImageIcon,
  },
];
