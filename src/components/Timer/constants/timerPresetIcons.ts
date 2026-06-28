import {
  Apple,
  Bolt,
  BookOpen,
  Brain,
  Briefcase,
  Code2,
  Coffee,
  Compass,
  Dumbbell,
  Flame,
  GraduationCap,
  Heart,
  Hourglass,
  Leaf,
  Moon,
  Mountain,
  Music,
  Pencil,
  Rocket,
  Star,
  Sun,
  Target,
  Timer as TimerIcon,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface PresetIconEntry {
  /** Stable serializable key persisted on a `TimerCustomPreset`. */
  key: string;
  /** Human-readable label shown in the icon picker. */
  label: string;
  /** Lucide component used at render time. */
  component: LucideIcon;
}

/**
 * Curated set of icons available for custom presets. Keys are stable so
 * persisted values keep working across releases — never rename, only add.
 */
export const PRESET_ICONS: PresetIconEntry[] = [
  { key: "timer", label: "Timer", component: TimerIcon },
  { key: "apple", label: "Apple", component: Apple },
  { key: "brain", label: "Brain", component: Brain },
  { key: "book-open", label: "Book", component: BookOpen },
  { key: "zap", label: "Lightning", component: Zap },
  { key: "coffee", label: "Coffee", component: Coffee },
  { key: "code-2", label: "Code", component: Code2 },
  { key: "music", label: "Music", component: Music },
  { key: "heart", label: "Heart", component: Heart },
  { key: "star", label: "Star", component: Star },
  { key: "flame", label: "Flame", component: Flame },
  { key: "target", label: "Target", component: Target },
  { key: "bolt", label: "Bolt", component: Bolt },
  { key: "rocket", label: "Rocket", component: Rocket },
  { key: "compass", label: "Compass", component: Compass },
  { key: "moon", label: "Moon", component: Moon },
  { key: "sun", label: "Sun", component: Sun },
  { key: "dumbbell", label: "Dumbbell", component: Dumbbell },
  { key: "pencil", label: "Pencil", component: Pencil },
  { key: "graduation-cap", label: "Graduate", component: GraduationCap },
  { key: "briefcase", label: "Briefcase", component: Briefcase },
  { key: "hourglass", label: "Hourglass", component: Hourglass },
  { key: "leaf", label: "Leaf", component: Leaf },
  { key: "mountain", label: "Mountain", component: Mountain },
];

/** Default icon key used when a preset has no icon set. */
export const DEFAULT_PRESET_ICON_KEY = "timer";
