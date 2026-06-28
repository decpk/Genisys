import { memo, useEffect, useMemo, useState } from "react";
import {
  GripVertical,
  RefreshCw,
  X,
  ExternalLink,
  Clock,
  Globe,
  RotateCcw,
} from "lucide-react";

import { AppInlineLoader, AppLoaderGlyph } from "@/components/AppLoader";
import { IconButton } from "@/components/ui/icon-button";
import { EmptyState } from "@/components/ui/empty-state";
import { relativeTime } from "@/lib/format";
import { useLiveScoresStore } from "@/store/live-scores-store";
import type { DragHandleProps } from "../SortableTile/SortableTile.types";
import type {
  LiveSportTileConfig,
  RefreshInterval,
} from "./LiveSportsTile.types";
import { REFRESH_OPTIONS } from "./LiveSportsTile.types";
import { getSportIcon, getSportLabel } from "./sports-catalog";
import { useSportsLiveScoreData } from "./hooks/useSportsLiveScoreData";
import { SportsNotificationSettings } from "./SportsNotificationSettings";
import { MatchTabs } from "./MatchTabs";
import { formatCountdown } from "./utils/formatCountdown";
import { getStatusLabel } from "./utils/getStatusLabel";
import { getStatusDotColor } from "./utils/getStatusDotColor";
import { TileResizeMenu } from "../TileResizeMenu";

interface LiveSportScoreTileProps {
  tile: LiveSportTileConfig;
  dragHandleProps: DragHandleProps;
}

export const LiveSportScoreTile = memo(function LiveSportScoreTile({
  tile,
  dragHandleProps,
}: LiveSportScoreTileProps): React.JSX.Element {
  const removeSportTile = useLiveScoresStore((s) => s.removeSportTile);
  const setRefreshInterval = useLiveScoresStore((s) => s.setRefreshInterval);
  const setTileWidth = useLiveScoresStore((s) => s.setTileWidth);

  const [showSourceInput, setShowSourceInput] = useState(false);
  const [customSourceDraft, setCustomSourceDraft] = useState("");

  const {
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
  } = useSportsLiveScoreData(tile);

  // Track previous scores for flash animation across all matches
  // Key: "matchIdx-teamName" → previous score string
  const [prevScoresMap, setPrevScoresMap] = useState<Map<string, string>>(() => new Map());

  // Update the previous scores map whenever multiMatchData changes
  useEffect(() => {
    if (!multiMatchData) return;
    const newMap = new Map<string, string>();
    multiMatchData.matches.forEach((match, i) => {
      for (const team of match.teams) {
        newMap.set(`${i}-${team.name}`, team.score);
      }
    });
    // Defer update so the current render sees the OLD values for flash detection
    const timer = setTimeout(() => {
      setPrevScoresMap(newMap);
    }, 100);
    return () => clearTimeout(timer);
  }, [multiMatchData]);

  const SportIcon = useMemo(() => getSportIcon(tile.sportKey), [tile.sportKey]);
  const sportLabel =
    tile.sportKey === "custom" ? tile.query : getSportLabel(tile.sportKey);
  // Only show loader states when we have no data yet (initial load)
  const isInitialLoading =
    !scoreData &&
    !multiMatchData &&
    (status === "resolving-url" ||
      status === "crawling" ||
      status === "parsing" ||
      status === "idle");
  const isFetching =
    status === "resolving-url" || status === "crawling" || status === "parsing";
  const cooldownSeconds = Math.ceil(cooldownRemaining / 1000);

  const statusDotColor = getStatusDotColor(refreshing, status, isFetching);

  // Determine if we have multi-match data with actual matches to display
  const hasMultiMatchData = multiMatchData && multiMatchData.matches.length > 0;
  const allNoLive = hasMultiMatchData && multiMatchData.matches.every((m) => m.status === "no-live-match");
  const displayableMatches = hasMultiMatchData
    ? multiMatchData.matches.filter((m) => m.status !== "no-live-match")
    : [];

  const refreshItems = REFRESH_OPTIONS.map(({ value, label }) => ({
    key: String(value),
    label: `Auto-refresh: ${label}`,
    active: tile.refreshIntervalMs === value,
    onSelect: () => setRefreshInterval(tile.id, value as RefreshInterval),
  }));

  const handleSourceSubmit = (): void => {
    const url = customSourceDraft.trim();
    if (!url) return;
    setCustomSource(url);
    setShowSourceInput(false);
    setCustomSourceDraft("");
  };

  const handleSourceKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSourceSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowSourceInput(false);
      setCustomSourceDraft("");
    }
  };

  return (
    <div
      id={`tile-${tile.id}`}
      className="@container group relative border border-border rounded-lg bg-card overflow-hidden h-[400px] flex flex-col"
    >
      {/* Header */}
      <div className="relative flex items-center gap-2 px-4 pt-3 pb-2 border-b border-border">
        {/* Left section absorbs all width changes so action buttons stay anchored */}
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
          <div className={`w-2 h-2 rounded-full shrink-0 ${statusDotColor}`} />
          <SportIcon size={14} className="text-muted-foreground shrink-0" />
          <h3 className="text-sm font-semibold truncate">{sportLabel}</h3>

          {/* Refreshing indicator in header */}
          <span className={`text-[10px] text-amber-500 shrink-0 flex items-center gap-1 min-w-[74px] h-4 transition-opacity duration-150 ${refreshing ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <AppLoaderGlyph size={10} />
            Refreshing…
          </span>

          {/* Auto-delete countdown */}
          {autoDeleteRemaining > 0 && (
            <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
              · removing in {formatCountdown(autoDeleteRemaining)}
            </span>
          )}
        </div>

        {/* Last updated time — centered in header */}
        {lastFetchedAt && (
          <span className="absolute left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground tabular-nums pointer-events-none">
            {relativeTime(lastFetchedAt)}
          </span>
        )}

        {/* Actions — pinned to the far right, never shift */}
        <div className="flex items-center gap-0.5 shrink-0">
          {/* Notification settings */}
          <SportsNotificationSettings tile={tile} />

          {/* Change source */}
          <IconButton
            tooltip="Change source URL"
            tooltipSide="bottom"
            size="xs"
            onClick={() => {
              setCustomSourceDraft(sourceUrl ?? "");
              setShowSourceInput((v) => !v);
            }}
          >
            <Globe size={14} />
          </IconButton>

          {/* Re-resolve source (AI picks new URL) */}
          <IconButton
            tooltip="Find new source (AI)"
            tooltipSide="bottom"
            size="xs"
            disabled={cooldownSeconds > 0 || isFetching}
            onClick={refetchWithNewSource}
          >
            <RotateCcw size={14} />
          </IconButton>

          {/* Refresh interval dropdown */}
          <Dropdown
            items={refreshItems}
            trigger={<Clock size={14} />}
            triggerProps={{
              tooltip:
                tile.refreshIntervalMs > 0
                  ? `Auto-refresh: ${REFRESH_OPTIONS.find((o) => o.value === tile.refreshIntervalMs)?.label ?? "On"}`
                  : "Auto-refresh: Off",
              tooltipSide: "bottom",
              size: "xs",
            }}
          />

          {/* Manual reload */}
          <IconButton
            tooltip={
              cooldownSeconds > 0 ? `Wait ${cooldownSeconds}s` : "Reload now"
            }
            tooltipSide="bottom"
            size="xs"
            disabled={cooldownSeconds > 0 || isFetching}
            onClick={refetch}
          >
            {isFetching ? <AppLoaderGlyph size={14} /> : <RefreshCw size={14} />}
          </IconButton>

          {/* Resize */}
          <TileResizeMenu
            tileWidth={tile.tileWidth}
            onWidthChange={(width) => setTileWidth(tile.id, width)}
          />

          {/* Drag handle */}
          <IconButton
            tooltip="Drag to reorder"
            tooltipSide="bottom"
            size="xs"
            className="cursor-grab active:cursor-grabbing"
            {...dragHandleProps.attributes}
            {...dragHandleProps.listeners}
          >
            <GripVertical size={14} />
          </IconButton>

          {/* Close */}
          <IconButton
            tooltip="Remove this score tile"
            tooltipSide="bottom"
            size="xs"
            onClick={() => removeSportTile(tile.id)}
          >
            <X size={14} />
          </IconButton>
        </div>
      </div>

      {/* Source URL input bar (toggled via Globe icon) */}
      {showSourceInput && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-accent/30">
          <Globe size={12} className="text-muted-foreground shrink-0" />
          <input
            type="url"
            value={customSourceDraft}
            onChange={(e) => setCustomSourceDraft(e.target.value)}
            onKeyDown={handleSourceKeyDown}
            placeholder="Paste a custom score page URL…"
            autoFocus
            className="flex-1 text-xs bg-transparent border-none outline-none placeholder:text-muted-foreground/60"
          />
          <button
            onClick={handleSourceSubmit}
            disabled={!customSourceDraft.trim()}
            className="text-[11px] px-2 py-0.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Use
          </button>
          <button
            onClick={() => {
              setShowSourceInput(false);
              setCustomSourceDraft("");
            }}
            className="text-[11px] px-1.5 py-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-hidden p-3">
        {/* Loading skeleton — only on initial load (no data yet) */}
        {isInitialLoading && (
          <div className="flex flex-col items-center justify-center h-full">
            <AppInlineLoader message={getStatusLabel(status)} />
          </div>
        )}

        {/* Error state — only when we have no score data to show */}
        {status === "error" && !scoreData && !hasMultiMatchData && (
          <div className="flex flex-col items-center justify-center h-full gap-3 px-4">
            <p className="text-xs text-destructive text-center font-medium">
              {error}
            </p>
            {errorDetail && (
              <p className="text-[10px] text-muted-foreground text-center leading-relaxed max-w-[280px]">
                {errorDetail}
              </p>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={refetch}
                disabled={cooldownSeconds > 0}
                className="text-xs px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => {
                  setCustomSourceDraft(sourceUrl ?? "");
                  setShowSourceInput(true);
                }}
                className="text-xs px-3 py-1 rounded border border-border text-foreground hover:bg-accent transition-colors"
              >
                Change source
              </button>
            </div>
          </div>
        )}

        {/* Idle state — only when no data */}
        {status === "idle" && !scoreData && !hasMultiMatchData && (
          <div className="h-full flex items-center justify-center">
            <EmptyState message="Preparing to fetch scores…" className="py-12" />
          </div>
        )}

        {/* Ready — no live match (all matches report no-live-match) */}
        {(allNoLive || (scoreData?.status === "no-live-match" && !hasMultiMatchData)) && (
          <div className="flex flex-col items-center justify-center h-full gap-2 px-4 text-center">
            <EmptyState
              message={`No live match right now${tile.refreshIntervalMs > 0 ? `. Auto-refreshing every ${REFRESH_OPTIONS.find((o) => o.value === tile.refreshIntervalMs)?.label ?? "?"}` : ""}`}
              className="py-8"
            />
            {scoreData?.competition && (
              <p className="text-xs text-muted-foreground">
                {scoreData.competition}
              </p>
            )}
            {scoreData?.period && (
              <p className="text-[10px] text-muted-foreground/70">
                {scoreData.period}
              </p>
            )}
          </div>
        )}

        {/* Multi-match view — shown when we have displayable matches */}
        {displayableMatches.length > 0 && (
          <MatchTabs
            matches={displayableMatches}
            prevScoresMap={prevScoresMap}
          />
        )}
      </div>

      {/* Footer — source link */}
      {sourceUrl && (status === "ready" || status === "error") && (
        <div className="flex items-center gap-1.5 px-3 h-[42px] shrink-0 border-t border-border">
          <ExternalLink
            size={10}
            className="text-muted-foreground/50 shrink-0"
          />
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-muted-foreground/60 hover:text-muted-foreground truncate transition-colors"
          >
            {(() => {
              try {
                return new URL(sourceUrl).hostname;
              } catch {
                return sourceUrl;
              }
            })()}{" "}
            — AI parsed
          </a>

          {/* Next auto-refresh countdown */}
          {!refreshing && nextRefreshIn > 0 && tile.refreshIntervalMs > 0 && (
            <span className="ml-auto text-[10px] text-muted-foreground/70 tabular-nums shrink-0 flex items-center gap-0.5">
              Refreshes in{" "}
              <span className="inline-flex overflow-hidden h-[14px] items-center">
                <span
                  key={nextRefreshIn}
                  className="inline-block font-medium animate-refresh-slot leading-[14px]"
                >
                  {nextRefreshIn}s
                </span>
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  );
});
