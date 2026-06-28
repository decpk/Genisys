import { Apple, BookOpen, Brain, Timer as TimerIcon, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { TimerMode } from "@/store/timer-store/timer-store.types";

export interface TimerPreset {
  id: string;
  label: string;
  mode: TimerMode;
  durationSec: number;
  breakSec?: number;
  icon: LucideIcon;
  /** Stable lookup key into the icon registry. Used when duplicating into a custom preset. */
  iconKey: string;
  /** One-line tagline shown under the title in the hover popover. */
  tagline: string;
  /** Long-form description: what it is, who it's for, when to use it. */
  description: string;
  /** Short bullet list of best-fit use cases. */
  bestFor: string[];
}

export const TIMER_PRESETS: TimerPreset[] = [
  {
    id: "pomodoro-25-5",
    label: "Pomodoro 25/5",
    mode: "pomodoro",
    durationSec: 25 * 60,
    breakSec: 5 * 60,
    icon: Apple,
    iconKey: "apple",
    tagline: "The classic Pomodoro Technique",
    description:
      "Work in 25-minute focused sprints separated by 5-minute breaks, with a longer break every 4 sessions. Created by Francesco Cirillo in the late 1980s, it's the most widely used time-boxing method for sustained productivity without burnout.",
    bestFor: [
      "Email, admin, and routine tasks",
      "Studying short topics or flashcards",
      "Beginners building a focus habit",
    ],
  },
  {
    id: "deep-work-50-10",
    label: "Deep Work 50/10",
    mode: "pomodoro",
    durationSec: 50 * 60,
    breakSec: 10 * 60,
    icon: Brain,
    iconKey: "brain",
    tagline: "Longer sprints for cognitively demanding work",
    description:
      "50 minutes of uninterrupted focus followed by a 10-minute break. Inspired by Cal Newport's Deep Work principles, this preset suits work that needs ramp-up time and sustained concentration before flow kicks in.",
    bestFor: [
      "Coding, writing, design",
      "Complex problem solving",
      "Reading dense technical material",
    ],
  },
  {
    id: "study-90-15",
    label: "Study 90/15",
    mode: "pomodoro",
    durationSec: 90 * 60,
    breakSec: 15 * 60,
    icon: BookOpen,
    iconKey: "book-open",
    tagline: "Aligned with the body's ultradian rhythm",
    description:
      "90-minute study blocks followed by 15-minute restorative breaks. Based on Nathan Kleitman's BRAC research showing the brain naturally cycles through ~90-minute peaks of alertness. Ideal for long study or research sessions.",
    bestFor: [
      "Exam prep and long-form study",
      "Research, analysis, deep reading",
      "Single-topic deep dives",
    ],
  },
  {
    id: "quick-15",
    label: "Quick 15",
    mode: "countdown",
    durationSec: 15 * 60,
    icon: Zap,
    iconKey: "zap",
    tagline: "A short, single sprint — no breaks",
    description:
      "A standalone 15-minute countdown with no break cycle. Perfect for time-boxing a quick task, breaking procrastination by committing to just 15 minutes, or fitting focused work into a small gap in your day.",
    bestFor: [
      "Quick tasks and inbox triage",
      "Breaking procrastination (\u201Cjust 15 minutes\u201D)",
      "Time-boxed meetings or reviews",
    ],
  },
  {
    id: "stopwatch",
    label: "Stopwatch",
    mode: "stopwatch",
    durationSec: 0,
    icon: TimerIcon,
    iconKey: "timer",
    tagline: "Count up — no fixed end time",
    description:
      "An open-ended timer that counts up from zero. Use it when you don't know how long a task will take but want an accurate record of time spent — useful for billing, audits, or simply learning your own pace on a new kind of work.",
    bestFor: [
      "Tracking actual time on a task",
      "Open-ended exploration / learning",
      "Billable work and time audits",
    ],
  },
];
