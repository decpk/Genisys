import { useState, memo, useCallback, useEffect } from "react";
import {
  ChevronRight,
  Activity,
  MessageSquare,
  CheckCircle2,
  Clock,
  Zap,
  Copy,
  Check,
  Timer,
} from "lucide-react";
import { AppLoaderGlyph } from '@/components/AppLoader'

import { useChatHistoryStore } from "@/store/chat-history-store";
import type { ToolCallRecord, ToolCallSummary } from "@/store/chat-history-store";
import {
  TOOL_ICONS,
  TOOL_LABELS,
  formatArgs,
} from "../../ToolCallBlock/ToolCallBlock.constants";

// ─── Helpers ─────────────────────────────────────────────────────

function getDurationMs(startedAt: string, completedAt: string | null): number {
  if (!completedAt) return 0;
  return Math.max(
    0,
    new Date(completedAt).getTime() - new Date(startedAt).getTime(),
  );
}

function formatDuration(ms: number): string {
  if (ms === 0) return "...";
  if (ms < 1000) return `${ms}ms`;

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }
  return `${seconds}s`;
}

function formatDurationFromDates(
  startedAt: string,
  completedAt: string | null,
): string {
  return formatDuration(getDurationMs(startedAt, completedAt));
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

function parseArgs(argsStr: string): Record<string, unknown> {
  try {
    return JSON.parse(argsStr);
  } catch {
    return {};
  }
}

// ─── Main Component ──────────────────────────────────────────────

export function ActivityPanel(): React.JSX.Element {
  const activitySummaries = useChatHistoryStore((s) => s.activitySummaries);
  const isLoadingSummaries = useChatHistoryStore((s) => s.isLoadingSummaries);
  const summariesLoaded = useChatHistoryStore((s) => s.summariesLoaded);
  const activeConversationId = useChatHistoryStore((s) => s.activeConversationId);
  const loadActivitySummaries = useChatHistoryStore((s) => s.loadActivitySummaries);

  useEffect(() => {
    if (activeConversationId && !summariesLoaded && !isLoadingSummaries) {
      loadActivitySummaries(activeConversationId);
    }
  }, [activeConversationId, summariesLoaded, isLoadingSummaries, loadActivitySummaries]);

  if (!activeConversationId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 px-6">
        <div className="rounded-xl bg-muted/40 p-4">
          <Activity size={28} className="text-muted-foreground/50" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-foreground/70">
            No activity yet
          </p>
          <p className="text-xs text-muted-foreground">
            Tool calls will appear here as the AI works.
          </p>
        </div>
      </div>
    );
  }

  if (isLoadingSummaries || !summariesLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <AppLoaderGlyph size={24} className="text-primary" />
        <p className="text-xs text-muted-foreground">Loading activity...</p>
      </div>
    );
  }

  if (activitySummaries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 px-6">
        <div className="rounded-xl bg-muted/40 p-4">
          <Activity size={28} className="text-muted-foreground/50" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-foreground/70">
            No activity yet
          </p>
          <p className="text-xs text-muted-foreground">
            Tool calls will appear here as the AI works.
          </p>
        </div>
      </div>
    );
  }

  const totalCalls = activitySummaries.reduce((sum, s) => sum + s.totalCount, 0);
  const totalDone = activitySummaries.reduce((sum, s) => sum + s.doneCount, 0);
  const totalRunning = totalCalls - totalDone;
  const messageCount = activitySummaries.length;

  return (
    <div className="flex flex-col h-full">
      {/* Summary header */}
      <div className="px-3 py-3 border-b border-border/50 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Zap size={14} className="text-primary" />
            Activity
          </h2>
          {totalRunning > 0 && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
              <AppLoaderGlyph size={11} />
              {totalRunning} running
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-500" />
            {totalDone}/{totalCalls} calls
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare size={12} />
            {messageCount} msg{messageCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Scrollable message groups */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {activitySummaries.map((summary, idx) => (
          <MessageGroupCard
            key={summary.messageId}
            summary={summary}
            messageIndex={idx + 1}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────

function getUniqueToolNames(toolCalls: ToolCallRecord[] | undefined): string[] {
  if (!toolCalls) return [];
  const seen = new Set<string>();
  return toolCalls.reduce<string[]>((acc, tc) => {
    if (!seen.has(tc.toolName)) {
      seen.add(tc.toolName);
      acc.push(tc.toolName);
    }
    return acc;
  }, []);
}

const MessageGroupCard = memo(function MessageGroupCard({
  summary,
  messageIndex,
}: {
  summary: ToolCallSummary;
  messageIndex: number;
}): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const loadMessageToolCalls = useChatHistoryStore((s) => s.loadMessageToolCalls);
  const toolCalls = useChatHistoryStore((s) => s.expandedToolCalls[summary.messageId]);
  const isLoadingThis = useChatHistoryStore((s) => s.loadingMessageIds.includes(summary.messageId));
  const allDone = summary.doneCount === summary.totalCount;
  const hasRunning = summary.doneCount < summary.totalCount;
  const uniqueTools = getUniqueToolNames(toolCalls);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next && !toolCalls && !isLoadingThis) {
        loadMessageToolCalls(summary.messageId);
      }
      return next;
    });
  }, [toolCalls, isLoadingThis, loadMessageToolCalls, summary.messageId]);

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all duration-200 ${
        isOpen
          ? "border-border/60 bg-card/80 shadow-sm"
          : "border-border/30 bg-card/40 hover:border-border/50 hover:bg-card/60"
      }`}
    >
      {/* Trigger */}
      <button
        onClick={handleToggle}
        className="w-full text-left cursor-pointer px-3.5 py-3 transition-colors hover:bg-muted/20"
      >
        {/* Top row: index badge + status + chevron */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <div
            className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-lg text-[11px] font-bold ${
              hasRunning
                ? "bg-primary/15 text-primary ring-1 ring-primary/20"
                : "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/15"
            }`}
          >
            {messageIndex}
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-[12px] font-semibold text-foreground/90">
              Message #{messageIndex}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {allDone ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <CheckCircle2 size={10} />
                {summary.totalCount} done
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                <AppLoaderGlyph size={10} />
                {summary.doneCount}/{summary.totalCount}
              </span>
            )}
            <ChevronRight
              size={14}
              className={`text-muted-foreground/50 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
            />
          </div>
        </div>

        {/* Time info row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 ml-0.5">
          <div className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
            <div className="flex items-center justify-center w-4 h-4 rounded bg-muted/50">
              <Clock size={9} className="text-muted-foreground/50" />
            </div>
            <span className="text-muted-foreground/45 font-medium">Start</span>
            <span className="tabular-nums text-foreground/60">
              {formatTime(summary.firstStartedAt)}
            </span>
          </div>

          {summary.lastCompletedAt ? (
            <div className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
              <div className="flex items-center justify-center w-4 h-4 rounded bg-muted/50">
                <Clock size={9} className="text-muted-foreground/50" />
              </div>
              <span className="text-muted-foreground/45 font-medium">End</span>
              <span className="tabular-nums text-foreground/60">
                {formatTime(summary.lastCompletedAt)}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-[10px]">
              <AppLoaderGlyph size={10} className="text-primary" />
              <span className="font-medium text-primary">In progress</span>
            </div>
          )}

          {summary.totalDurationMs > 0 && (
            <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/8 px-2 py-0.5 rounded-full">
              <Timer size={10} />
              {formatDuration(summary.totalDurationMs)}
            </div>
          )}
        </div>

        {/* Tool badges (shown once loaded) */}
        {uniqueTools.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5 ml-0.5">
            {uniqueTools.map((toolName) => {
              const ToolIcon = TOOL_ICONS[toolName] ?? Activity;
              const toolLabel = TOOL_LABELS[toolName] ?? toolName;
              return (
                <span
                  key={toolName}
                  className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/70 bg-muted/40 px-1.5 py-0.5 rounded-md ring-1 ring-border/20"
                >
                  <ToolIcon
                    size={10}
                    className="text-muted-foreground/50 shrink-0"
                  />
                  <span className="truncate max-w-[100px]">{toolLabel}</span>
                </span>
              );
            })}
          </div>
        )}
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="border-t border-border/30 bg-muted/5">
          <div className="px-3 py-2 space-y-1">
            {isLoadingThis ? (
              <div className="flex items-center justify-center gap-2 py-6">
                <AppLoaderGlyph size={16} className="text-primary" />
                <span className="text-xs text-muted-foreground">
                  Loading tool calls...
                </span>
              </div>
            ) : toolCalls ? (
              toolCalls.map((tc, i) => (
                <div
                  key={tc.id}
                  className="animate-activity-fade-in"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <ToolCallRow data={tc} />
                </div>
              ))
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
});

const ToolCallRow = memo(function ToolCallRow({
  data,
}: {
  data: ToolCallRecord;
}): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const Icon = TOOL_ICONS[data.toolName] ?? Activity;
  const label = TOOL_LABELS[data.toolName] ?? data.toolName;
  const args = parseArgs(data.args);
  const argSummary = formatArgs(data.toolName, args);
  const isRunning = data.status === "running";
  const hasResult = !!data.result;

  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.result) {
      navigator.clipboard.writeText(data.result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [data.result]);

  return (
    <div className="rounded-md border border-border/25 bg-card/60 overflow-hidden transition-all duration-150">
      {/* Tool call header */}
      <button
        onClick={() => hasResult && setExpanded((p) => !p)}
        className={`w-full flex items-center gap-2 px-2.5 py-2 text-left transition-colors ${
          hasResult ? "cursor-pointer hover:bg-muted/20" : "cursor-default"
        }`}
      >
        {/* Icon */}
        <div className="relative shrink-0">
          <div
            className={`flex items-center justify-center w-7 h-7 rounded-md ${
              isRunning
                ? "bg-primary/10 text-primary"
                : "bg-muted/50 text-muted-foreground"
            }`}
          >
            {isRunning ? <AppLoaderGlyph size={14} /> : <Icon size={14} />}
          </div>
          <div
            className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-[1.5px] ring-card ${
              isRunning ? "bg-primary animate-pulse" : "bg-emerald-500"
            }`}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-medium text-foreground/90 truncate">
              {label}
            </span>
          </div>
          {argSummary && (
            <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">
              {argSummary}
            </p>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-1.5 shrink-0">
          {data.completedAt && (
            <span className="inline-flex items-center gap-0.5 text-[9px] tabular-nums font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/8 px-1.5 py-0.5 rounded">
              <Timer size={9} />
              {formatDurationFromDates(data.startedAt, data.completedAt)}
            </span>
          )}
          {!data.completedAt && isRunning && (
            <span className="inline-flex items-center gap-1 text-[9px] text-primary bg-primary/8 px-1.5 py-0.5 rounded">
              <AppLoaderGlyph size={9} />
              running
            </span>
          )}
          {hasResult && (
            <ChevronRight
              size={12}
              className={`text-muted-foreground/40 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
            />
          )}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-border/20 animate-activity-result-reveal">
          {/* Timing details */}
          <div className="px-3 py-2 bg-muted/10 border-b border-border/15 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/70">
              <Clock size={10} className="text-muted-foreground/50" />
              <span className="text-muted-foreground/40">Start:</span>
              <span className="tabular-nums">{formatTime(data.startedAt)}</span>
            </span>
            {data.completedAt && (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/70">
                <Clock size={10} className="text-muted-foreground/50" />
                <span className="text-muted-foreground/40">End:</span>
                <span className="tabular-nums">
                  {formatTime(data.completedAt)}
                </span>
              </span>
            )}
            {data.completedAt && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <Timer size={10} />
                {formatDurationFromDates(data.startedAt, data.completedAt)}
              </span>
            )}
          </div>

          {/* Arguments */}
          {Object.keys(args).length > 0 && (
            <div className="px-3 py-2 border-b border-border/15">
              <p className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider mb-1.5">
                Arguments
              </p>
              <div className="space-y-1">
                {Object.entries(args).map(([key, val]) => (
                  <div key={key} className="flex gap-2 text-[11px]">
                    <span className="shrink-0 text-primary/70 font-medium">
                      {key}:
                    </span>
                    <span className="text-muted-foreground break-all whitespace-pre-wrap">
                      {typeof val === "string"
                        ? val
                        : JSON.stringify(val, null, 2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Result */}
          {data.result && (
            <div>
              <div className="flex items-center justify-between px-3 py-1.5 bg-muted/15">
                <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">
                  Result
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-muted/40"
                >
                  {copied ? (
                    <>
                      <Check size={10} className="text-emerald-500" />
                      <span className="text-emerald-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={10} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-[11px] leading-relaxed text-muted-foreground px-3 py-2.5 overflow-x-auto whitespace-pre-wrap break-all max-h-[400px] overflow-y-auto">
                {data.result}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
