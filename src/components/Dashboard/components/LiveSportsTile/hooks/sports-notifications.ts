import { notify } from "@/frameworks/notification";
import type {
  LiveSportTileConfig,
  MatchData,
  MultiMatchScoreData,
  NotifyChannel,
  ScoreData,
} from "../LiveSportsTile.types";

export type SportsEvent =
  | {
      kind: "score-change";
      teamName: string;
      oldScore: string;
      newScore: string;
    }
  | { kind: "status-change"; oldStatus: string; newStatus: string }
  | { kind: "period-change"; newPeriod: string };

function buildNotification(
  tile: LiveSportTileConfig,
  event: SportsEvent,
  scoreData: ScoreData,
): { title: string; message: string } {
  const teams = scoreData.teams.map((t) => t.name).join(" vs ");

  switch (event.kind) {
    case "score-change":
      return {
        title: `⚡ ${event.teamName} just scored!`,
        message: `${scoreData.competition} — ${event.oldScore} → ${event.newScore}  |  ${teams}`,
      };
    case "status-change":
      if (event.newStatus === "live") {
        return {
          title: `🔴 ${scoreData.competition} is LIVE`,
          message: `${teams} — Match has started!`,
        };
      }
      if (event.newStatus === "completed") {
        const summary = scoreData.teams
          .map((t) => `${t.name} ${t.score}`)
          .join(" • ");
        return {
          title: `🏁 Match Over!`,
          message: `${scoreData.competition} — Final: ${summary}`,
        };
      }
      return {
        title: `📢 ${scoreData.competition}`,
        message: `Status changed to ${event.newStatus} — ${teams}`,
      };
    case "period-change": {
      const scores = scoreData.teams
        .map((t) => `${t.name} ${t.score}`)
        .join(" • ");
      return {
        title: `⏱ ${event.newPeriod}`,
        message: `${scoreData.competition} — ${scores}`,
      };
    }
  }
}

function dispatchToChannel(
  channel: NotifyChannel,
  title: string,
  message: string,
  tileId: string,
): void {
  if (channel === "off") return;

  const base = { source: "live-sports", meta: { tileId } } as const;

  if (channel === "app" || channel === "both") {
    notify({ ...base, title, message, channel: "app", duration: 8000 });
  }
  if (channel === "os" || channel === "both") {
    notify({ ...base, title, message, channel: "os" });
  }
}

export function emitSportsNotification(
  tile: LiveSportTileConfig,
  event: SportsEvent,
  scoreData: ScoreData,
  isFocused: boolean,
): void {
  // Check per-tile toggles
  if (event.kind === "score-change" && !tile.notifyOnScore) return;
  if (event.kind === "status-change" && !tile.notifyOnStatus) return;
  if (event.kind === "period-change" && !tile.notifyOnPeriod) return;

  const { title, message } = buildNotification(tile, event, scoreData);
  const channel = isFocused ? tile.notifyWhenFocused : tile.notifyWhenUnfocused;

  dispatchToChannel(channel, title, message, tile.id);
}

/**
 * Compare previous and next ScoreData and return all detected important events.
 * Returns empty array if prev is null (first observation — skip to avoid spam on startup).
 */
export function detectSportsEvents(
  prev: ScoreData | null,
  next: ScoreData,
): SportsEvent[] {
  if (!prev) return [];

  const events: SportsEvent[] = [];

  // Status change
  if (prev.status !== next.status) {
    events.push({
      kind: "status-change",
      oldStatus: prev.status,
      newStatus: next.status,
    });
  }

  // Score changes — compare each team
  for (let i = 0; i < next.teams.length; i++) {
    const prevTeam = prev.teams[i];
    const nextTeam = next.teams[i];
    if (!prevTeam || !nextTeam) continue;
    if (prevTeam.score !== nextTeam.score && prevTeam.score !== "") {
      events.push({
        kind: "score-change",
        teamName: nextTeam.name,
        oldScore: prevTeam.score,
        newScore: nextTeam.score,
      });
    }
  }

  // Period change
  if (prev.period !== next.period && next.period) {
    events.push({ kind: "period-change", newPeriod: next.period });
  }

  return events;
}

// ─── Multi-match event types & functions ────────────────────────────

export type MultiMatchSportsEvent = SportsEvent & {
  /** Which match this event belongs to (competition + teams for context) */
  matchLabel: string
}

/**
 * Build a human-readable label for a match (used in notification context).
 */
function buildMatchLabel(match: MatchData): string {
  const teams = match.teams.map((t) => t.name).join(' vs ')
  return match.competition ? `${match.competition} — ${teams}` : teams
}

/**
 * Find the best-matching previous match for a given next match.
 * Matches by comparing team names (order-independent).
 */
function findPreviousMatch(
  prevMatches: MatchData[],
  nextMatch: MatchData,
): MatchData | null {
  const nextTeamNames = new Set(nextMatch.teams.map((t) => t.name.toLowerCase()))

  return (
    prevMatches.find((pm) => {
      const pmTeamNames = new Set(pm.teams.map((t) => t.name.toLowerCase()))
      if (pmTeamNames.size !== nextTeamNames.size) return false
      for (const name of nextTeamNames) {
        if (!pmTeamNames.has(name)) return false
      }
      return true
    }) ?? null
  )
}

/**
 * Detect events across all matches by matching previous ↔ next by team names.
 * Returns empty array on first observation (prev is null).
 */
export function detectMultiMatchSportsEvents(
  prev: MultiMatchScoreData | null,
  next: MultiMatchScoreData,
): MultiMatchSportsEvent[] {
  if (!prev) return []

  const events: MultiMatchSportsEvent[] = []

  for (const nextMatch of next.matches) {
    const prevMatch = findPreviousMatch(prev.matches, nextMatch)
    if (!prevMatch) continue

    const matchLabel = buildMatchLabel(nextMatch)

    // Status change
    if (prevMatch.status !== nextMatch.status) {
      events.push({
        kind: 'status-change',
        oldStatus: prevMatch.status,
        newStatus: nextMatch.status,
        matchLabel,
      })
    }

    // Score changes
    for (let i = 0; i < nextMatch.teams.length; i++) {
      const prevTeam = prevMatch.teams[i]
      const nextTeam = nextMatch.teams[i]
      if (!prevTeam || !nextTeam) continue
      if (prevTeam.score !== nextTeam.score && prevTeam.score !== '') {
        events.push({
          kind: 'score-change',
          teamName: nextTeam.name,
          oldScore: prevTeam.score,
          newScore: nextTeam.score,
          matchLabel,
        })
      }
    }

    // Period change
    if (prevMatch.period !== nextMatch.period && nextMatch.period) {
      events.push({
        kind: 'period-change',
        newPeriod: nextMatch.period,
        matchLabel,
      })
    }
  }

  return events
}

/**
 * Build notification content for a multi-match event (includes match context).
 */
function buildMultiMatchNotification(
  event: MultiMatchSportsEvent,
): { title: string; message: string } {
  switch (event.kind) {
    case 'score-change':
      return {
        title: `⚡ ${event.teamName} just scored!`,
        message: `${event.matchLabel} — ${event.oldScore} → ${event.newScore}`,
      }
    case 'status-change':
      if (event.newStatus === 'live') {
        return {
          title: `🔴 Match is LIVE`,
          message: `${event.matchLabel} — Match has started!`,
        }
      }
      if (event.newStatus === 'completed') {
        return {
          title: `🏁 Match Over!`,
          message: event.matchLabel,
        }
      }
      return {
        title: `📢 Status: ${event.newStatus}`,
        message: event.matchLabel,
      }
    case 'period-change':
      return {
        title: `⏱ ${event.newPeriod}`,
        message: event.matchLabel,
      }
  }
}

/**
 * Emit a notification for a multi-match event, respecting per-tile toggles.
 */
export function emitMultiMatchSportsNotification(
  tile: LiveSportTileConfig,
  event: MultiMatchSportsEvent,
  isFocused: boolean,
): void {
  if (event.kind === 'score-change' && !tile.notifyOnScore) return
  if (event.kind === 'status-change' && !tile.notifyOnStatus) return
  if (event.kind === 'period-change' && !tile.notifyOnPeriod) return

  const { title, message } = buildMultiMatchNotification(event)
  const channel = isFocused ? tile.notifyWhenFocused : tile.notifyWhenUnfocused

  dispatchToChannel(channel, title, message, tile.id)
}
