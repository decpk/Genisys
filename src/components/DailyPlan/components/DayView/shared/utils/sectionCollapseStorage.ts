/**
 * Persists the collapsed/expanded state of DayView section cards (Meetings,
 * Today's Tasks, Reviews, Completed) so the choice survives reloads and date
 * changes. State is a global UI preference, shared across all dates.
 */

export type SectionCollapseKey =
  | "meetings"
  | "tasks-active"
  | "reviews"
  | "tasks-completed";

const STORAGE_PREFIX = "genisys.dailyplan.collapse.";

function storageKeyFor(key: SectionCollapseKey): string {
  return `${STORAGE_PREFIX}${key}`;
}

export function readSectionCollapsed(
  key: SectionCollapseKey,
  fallback: boolean,
): boolean {
  try {
    const raw = localStorage.getItem(storageKeyFor(key));
    if (raw === null) return fallback;
    return raw === "true";
  } catch {
    return fallback;
  }
}

export function writeSectionCollapsed(
  key: SectionCollapseKey,
  value: boolean,
): void {
  try {
    localStorage.setItem(storageKeyFor(key), String(value));
  } catch {
    // Ignore storage failures (e.g. private mode / quota); collapse still works in-session.
  }
}
