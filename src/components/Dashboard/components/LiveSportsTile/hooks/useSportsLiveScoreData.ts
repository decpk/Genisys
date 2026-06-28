import { useCallback, useEffect, useRef, useState } from 'react'

import { parseJSON } from '@/lib/parse-json'
import { useSettingsStore } from '@/store/settings-store'
import { useLiveScoresStore } from '@/store/live-scores-store'
import { useIsAppActive } from '@/components/GenisysApp/active-app-registry'
import { useSecondTick } from '@/hooks/useSecondTick'
import { isWindowFocused } from "@/hooks";
import type { FetchStatus, LiveSportTileConfig, MultiMatchScoreData, ScoreData } from '../LiveSportsTile.types'
import { normalizeScoreData } from '../utils/normalizeScoreData'
import {
  detectSportsEvents,
  emitSportsNotification,
  detectMultiMatchSportsEvents,
  emitMultiMatchSportsNotification,
} from "./sports-notifications";
import { RESOLVE_URL_SYSTEM } from "@/prompts/dashboardSportsResolveUrlSystemPrompt";
import { PARSE_SCORES_SYSTEM } from "@/prompts/dashboardSportsParseScoresSystemPrompt";

const COOLDOWN_MS = 30_000
const AUTO_DELETE_DELAY_MS = 5 * 60 * 1000;

export interface UseSportsLiveScoreDataReturn {
  status: FetchStatus;
  refreshing: boolean;
  scoreData: ScoreData | null;
  multiMatchData: MultiMatchScoreData | null;
  sourceUrl: string | null;
  lastFetchedAt: string | null;
  error: string | null;
  errorDetail: string | null;
  cooldownRemaining: number;
  autoDeleteRemaining: number;
  nextRefreshIn: number;
  refetch: () => void;
  refetchWithNewSource: () => void;
  setCustomSource: (url: string) => void;
}

export function useSportsLiveScoreData(tile: LiveSportTileConfig): UseSportsLiveScoreDataReturn {
  const [status, setStatus] = useState<FetchStatus>('idle')
  const [refreshing, setRefreshing] = useState(false);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [multiMatchData, setMultiMatchData] = useState<MultiMatchScoreData | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(
    tile.sourceUrl || null,
  );
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  const inFlightRef = useRef(false);
  const cancelledRef = useRef(false);
  const lastManualFetchRef = useRef(0);
  // Timestamp marking the start of the current auto-refresh waiting window.
  // Held in a ref so it survives effect re-runs (e.g. active toggles): the
  // countdown freezes/resumes correctly and staleness can be computed on
  // re-activation instead of resetting every time the loop re-mounts.
  const lastRefreshAtRef = useRef(Date.now());
  const mountedRef = useRef(true);
  // Keep a ref to sourceUrl so doFetch always reads the latest without re-creating
  const sourceUrlRef = useRef(sourceUrl);
  sourceUrlRef.current = sourceUrl;

  // Refs for event detection, notifications, and auto-delete
  const prevScoreDataRef = useRef<ScoreData | null>(null);
  const prevMultiMatchRef = useRef<MultiMatchScoreData | null>(null);
  const completedAtRef = useRef<number | null>(null);
  const autoDeleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Keep tile ref current so callbacks read latest notification settings without re-creating
  const tileRef = useRef(tile);
  tileRef.current = tile;

  const chatModel = useSettingsStore((s) => s.chatModel)
  const storeSetSourceUrl = useLiveScoresStore((s) => s.setSourceUrl)
  const removeSportTile = useLiveScoresStore((s) => s.removeSportTile);

  // Gate background work to when the Dashboard app is the visible app, so a
  // hidden Dashboard does zero network/LLM/clock work for this tile.
  const isActive = useIsAppActive('dashboard');
  // Shared 1 Hz ticker that drives the countdown UIs below. It is paused on
  // window blur AND opted-out (no re-renders, no interval cost) while the
  // Dashboard is hidden.
  useSecondTick(isActive);

  // Core fetch: if we have a cached sourceUrl, skip URL resolution and go straight to crawl+parse
  const doFetch = useCallback(
    async (forceResolve = false) => {
      if (inFlightRef.current) return;

      inFlightRef.current = true;
      cancelledRef.current = false;

      // If we already have scoreData, this is a background refresh — keep existing data visible
      const isBackgroundRefresh = prevScoreDataRef.current !== null;
      if (isBackgroundRefresh) {
        setRefreshing(true);
      }

      try {
        let urlToFetch = forceResolve
          ? null
          : sourceUrlRef.current || tile.sourceUrl || null;

        // Step 1: Resolve URL via LLM (only if no cached source or forced)
        if (!urlToFetch) {
          if (!mountedRef.current) return;
          if (!isBackgroundRefresh) {
            setStatus("resolving-url");
          }
          setError(null);
          setErrorDetail(null);

          const urlResult = await window.api.llmJsonCompletion({
            systemPrompt: RESOLVE_URL_SYSTEM,
            userPrompt: `Find the best URL for live scores: ${tile.query}`,
            model: chatModel,
          });

          if (cancelledRef.current || !mountedRef.current) return;
          if (!urlResult.success || !urlResult.content) {
            setStatus("error");
            setError("Failed to find a score source");
            setErrorDetail(
              urlResult.error ??
                "The AI could not resolve a URL for this sport. Try providing a custom source URL.",
            );
            return;
          }

          try {
            const parsed = parseJSON<{ url: string }>(urlResult.content);
            urlToFetch = parsed.url;
          } catch {
            setStatus("error");
            setError("Invalid response from AI");
            setErrorDetail(
              "The AI returned data that could not be parsed as a URL. Try providing a custom source URL.",
            );
            return;
          }

          if (!urlToFetch || typeof urlToFetch !== "string") {
            setStatus("error");
            setError("No valid URL found");
            setErrorDetail(
              "The AI could not determine a suitable website for this sport. Try entering a custom source URL below.",
            );
            return;
          }
        }

        if (!mountedRef.current) return;
        setSourceUrl(urlToFetch);
        // Persist the resolved source URL so subsequent refreshes skip LLM resolution
        storeSetSourceUrl(tile.id, urlToFetch);

        // Step 2: Crawl the webpage (lite — skips root-domain hit, link extraction, caps at 20 KB)
        if (!isBackgroundRefresh) {
          setStatus("crawling");
        }
        const crawlResult = await window.api.crawlWebpageLite(urlToFetch);

        if (cancelledRef.current || !mountedRef.current) return;
        if (!crawlResult.success || !crawlResult.content) {
          setStatus("error");
          setError("Failed to fetch the score page");
          setErrorDetail(
            crawlResult.error
              ? `Crawl error: ${crawlResult.error}`
              : `Could not load content from ${urlToFetch}. The site may be blocking automated requests. Try a different source.`,
          );
          return;
        }

        // Step 3: Parse with LLM
        if (!isBackgroundRefresh) {
          setStatus("parsing");
        }
        const pageContent = [
          crawlResult.title ? `Page Title: ${crawlResult.title}` : "",
          crawlResult.description
            ? `Description: ${crawlResult.description}`
            : "",
          "",
          crawlResult.content?.slice(0, 15_000) ?? "",
        ]
          .filter(Boolean)
          .join("\n");

        const parseResult = await window.api.llmJsonCompletion({
          systemPrompt: PARSE_SCORES_SYSTEM,
          userPrompt: `Parse live scores from this page about "${tile.query}":\n\n${pageContent}`,
          model: chatModel,
        });

        if (cancelledRef.current || !mountedRef.current) return;
        if (!parseResult.success || !parseResult.content) {
          setStatus("error");
          setError("Failed to analyze scores");
          setErrorDetail(
            parseResult.error ??
              "The AI could not parse scores from the fetched page. The page format may not contain recognizable score data.",
          );
          return;
        }

        try {
          const raw = parseJSON<MultiMatchScoreData | ScoreData>(parseResult.content);
          const normalized = normalizeScoreData(raw);

          // Use the first match for backward-compat status checks (auto-delete, notifications)
          const primaryMatch = normalized.matches[0] ?? null;

          // Detect important events across all matches and emit notifications
          const events = detectMultiMatchSportsEvents(
            prevMultiMatchRef.current,
            normalized,
          );
          const focused = isWindowFocused();
          for (const event of events) {
            emitMultiMatchSportsNotification(tileRef.current, event, focused);
          }

          // Update previous multi-match data ref
          prevMultiMatchRef.current = normalized;

          // Still set scoreData for backward compat (use first match)
          if (primaryMatch) {
            const legacyScore: ScoreData = {
              competition: primaryMatch.competition,
              status: primaryMatch.status,
              teams: primaryMatch.teams,
              period: primaryMatch.period,
              extras: primaryMatch.extras,
              lastUpdated: primaryMatch.lastUpdated,
            };
            setScoreData(legacyScore);
          }

          setMultiMatchData(normalized);
          setStatus("ready");
          setRefreshing(false);
          setLastFetchedAt(new Date().toISOString());
          setError(null);
          setErrorDetail(null);

          // Auto-delete: when the match is completed, schedule tile removal.
          // Keep the REAL removal as a one-shot timeout so it still fires even
          // while the Dashboard is hidden; the visible "removing in …" countdown
          // (autoDeleteRemaining) is derived from completedAtRef via the shared
          // tick rather than its own per-tile interval.
          if (
            primaryMatch?.status === "completed" &&
            tileRef.current.autoDeleteOnEnd &&
            !completedAtRef.current
          ) {
            completedAtRef.current = Date.now();
            autoDeleteTimerRef.current = setTimeout(() => {
              removeSportTile(tileRef.current.id);
            }, AUTO_DELETE_DELAY_MS);
          }
        } catch {
          setStatus("error");
          setError("Could not parse score data");
          setErrorDetail(
            "The AI returned a response that could not be parsed as valid score data. Try refreshing or changing the source.",
          );
        }
      } catch (e) {
        if (!cancelledRef.current && mountedRef.current) {
          setStatus("error");
          setRefreshing(false);
          setError(e instanceof Error ? e.message : "Unknown error occurred");
          setErrorDetail(
            "An unexpected error occurred. Check your network connection and try again.",
          );
        }
      } finally {
        inFlightRef.current = false;
        if (mountedRef.current) setRefreshing(false);
      }
    },
    [
      tile.id,
      tile.query,
      tile.sourceUrl,
      chatModel,
      storeSetSourceUrl,
      removeSportTile,
    ],
  );

  // Start cooldown — only records the timestamp. The remaining time is derived
  // from it on each shared tick (see cooldownRemaining below), so there is no
  // per-tile 1 s interval to keep alive.
  const startCooldown = useCallback(() => {
    lastManualFetchRef.current = Date.now();
  }, []);

  // Manual refetch — reuses cached source URL (fast: crawl+parse only)
  const refetch = useCallback(() => {
    const elapsed = Date.now() - lastManualFetchRef.current;
    if (elapsed < COOLDOWN_MS) return;

    startCooldown();
    doFetch(false); // use cached source
  }, [doFetch, startCooldown]);

  // Force re-resolve URL from scratch (when user wants AI to pick a new source)
  const refetchWithNewSource = useCallback(() => {
    const elapsed = Date.now() - lastManualFetchRef.current;
    if (elapsed < COOLDOWN_MS) return;

    startCooldown();
    setSourceUrl(null);
    storeSetSourceUrl(tile.id, "");
    doFetch(true);
  }, [doFetch, startCooldown, tile.id, storeSetSourceUrl]);

  // Let user set a custom source URL directly
  const setCustomSource = useCallback(
    (url: string) => {
      const trimmed = url.trim();
      if (!trimmed) return;

      setSourceUrl(trimmed);
      sourceUrlRef.current = trimmed;
      storeSetSourceUrl(tile.id, trimmed);

      // Reset cooldown and fetch immediately with new source
      lastManualFetchRef.current = 0;
      inFlightRef.current = false;
      startCooldown();
      doFetch(false);
    },
    [doFetch, startCooldown, tile.id, storeSetSourceUrl],
  );

  // Initial fetch on mount
  useEffect(() => {
    mountedRef.current = true;
    doFetch(false);
    return () => {
      mountedRef.current = false;
      cancelledRef.current = true;
    };
  }, [doFetch]);

  // Reset the auto-refresh waiting-window anchor whenever the tile config
  // changes (interval, query, source, model — all captured by doFetch identity).
  // Mirrors the original behavior where a config change restarts the countdown
  // from a full interval. It deliberately does NOT depend on isActive, so a
  // hidden→visible transition preserves the elapsed time used for staleness.
  useEffect(() => {
    lastRefreshAtRef.current = Date.now();
  }, [tile.refreshIntervalMs, doFetch]);

  // Auto-refresh loop — the heavy background worker (LLM URL resolve + crawl +
  // AI parse). Suspended while the Dashboard is hidden (isActive === false) and
  // while the match is completed. The "refreshes in Ns" countdown is derived
  // from lastRefreshAtRef via the shared tick, so no per-tile interval runs here.
  useEffect(() => {
    if (tile.refreshIntervalMs <= 0) return;
    if (completedAtRef.current) return;
    if (!isActive) return; // pause background polling while the Dashboard is hidden

    let cancelled = false;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    // Arm the next refresh after `delayMs`. The timer fires AFTER the previous
    // fetch completes so a full interval elapses between responses.
    const armTimer = (delayMs: number) => {
      if (cancelled || completedAtRef.current) return;
      refreshTimer = setTimeout(async () => {
        if (cancelled || completedAtRef.current) return;
        if (!inFlightRef.current) {
          await doFetch(false);
        }
        if (cancelled || completedAtRef.current) return;
        lastRefreshAtRef.current = Date.now();
        armTimer(tile.refreshIntervalMs);
      }, delayMs);
    };

    // On (re)activation, refresh immediately if the data is stale — i.e. at least
    // a full interval has elapsed since the last refresh (e.g. the Dashboard was
    // hidden for a while). Otherwise resume the remaining slice of the current
    // window so the next fire still lands on schedule.
    const elapsed = Date.now() - lastRefreshAtRef.current;
    armTimer(
      elapsed >= tile.refreshIntervalMs ? 0 : tile.refreshIntervalMs - elapsed,
    );

    return () => {
      cancelled = true;
      if (refreshTimer) clearTimeout(refreshTimer);
    };
  }, [tile.refreshIntervalMs, doFetch, isActive]);

  // Cleanup the auto-delete removal timer on unmount.
  useEffect(() => {
    return () => {
      if (autoDeleteTimerRef.current) {
        clearTimeout(autoDeleteTimerRef.current);
      }
    };
  }, []);

  // ── Derived 1 Hz countdowns ───────────────────────────────────────────────
  // Computed from stored timestamps on each render. The shared useSecondTick
  // above drives these re-renders while the Dashboard is active and freezes them
  // while it is hidden/blurred; deriving from Date.now() keeps the values
  // correct across those pauses instead of drifting.
  const now = Date.now();
  const nextRefreshIn =
    tile.refreshIntervalMs > 0 && !completedAtRef.current
      ? Math.max(
          0,
          Math.ceil(
            (tile.refreshIntervalMs - (now - lastRefreshAtRef.current)) / 1000,
          ),
        )
      : 0;
  const cooldownRemaining = Math.max(
    0,
    COOLDOWN_MS - (now - lastManualFetchRef.current),
  );
  const autoDeleteRemaining = completedAtRef.current
    ? Math.max(0, AUTO_DELETE_DELAY_MS - (now - completedAtRef.current))
    : 0;

  return {
    status,
    refreshing,
    scoreData,
    multiMatchData,
    sourceUrl,
    lastFetchedAt,
    error,
    errorDetail,
    cooldownRemaining,
    autoDeleteRemaining,
    nextRefreshIn,
    refetch,
    refetchWithNewSource,
    setCustomSource,
  };
}
