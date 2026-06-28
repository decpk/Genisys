import { Check, Copy } from "lucide-react";
import {
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { JsonView } from "react-json-view-lite";
import type { StyleProps } from "react-json-view-lite/dist/DataRenderer";

import { useResizeHandle } from "@/hooks";
import { useThemeStore } from "@/store/theme-store";
import { THEMES } from "@/themes";
import { APP_MONACO_SCROLLBAR_OPTIONS, defineAppMonacoTheme } from "@/lib/monaco-theme";
import { Tooltip } from "@/components/Tooltip";
import { AppInlineLoader } from "@/components/AppLoader";

import {
  formatJsonPreview,
  formatTimestamp,
  formatDuration,
  getChannelAppSource,
  getStatusLabel,
  reconstructCommand,
  LARGE_JSON_THRESHOLD,
} from "../../DebugPanel.utils";
import { STATUS_COLORS, STATUS_BG_COLORS } from "../../DebugPanel.constants";
import type { RequestDetailProps } from "../../DebugPanel.types";

const THEME_ID = "debug-panel-theme";

export function RequestDetail({
  request,
}: RequestDetailProps): React.JSX.Element {
  const argsJson = formatJsonPreview(request.args);
  const responseJson = formatJsonPreview(request.response);
  const completedAtLabel = request.completedAt
    ? formatTimestamp(request.completedAt)
    : "—";
  const statusColor = STATUS_COLORS[request.status] ?? "text-muted-foreground";
  const statusBg = STATUS_BG_COLORS[request.status] ?? "";
  const statusLabel = getStatusLabel(request.status);
  const appSource = getChannelAppSource(request.channel);
  const cmdInfo = useMemo(
    () => reconstructCommand(request.channel, request.args),
    [request.channel, request.args],
  );

  return (
    <div className="h-full flex flex-col">
      {/* ── Top: request summary bar ─────────────────────────────── */}
      <div className="shrink-0 border-b border-border/40 bg-card px-4 py-3 space-y-2.5">
        {/* Row 1: channel + status + view toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-sm font-semibold text-foreground">
            {request.channel}
          </h2>
          <span
            className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${statusBg} ${statusColor}`}
          >
            {statusLabel}
          </span>
          <span className="text-[11px] text-muted-foreground bg-secondary/60 px-1.5 py-0.5 rounded">
            {appSource}
          </span>
        </div>

        {/* Row 2: metadata grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-x-6 gap-y-1">
          <MetaField label="Request ID" value={request.id} mono />
          <MetaField
            label="Started"
            value={formatTimestamp(request.startedAt)}
          />
          <MetaField label="Completed" value={completedAtLabel} />
          <MetaField
            label="Duration"
            value={formatDuration(request.duration)}
          />
        </div>

        {/* Row 3: command info */}
        <CommandBlock type={cmdInfo.type} command={cmdInfo.command} />

        {/* Error banner */}
        {request.error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
            <p className="text-[11px] font-medium text-red-500 mb-1">Error</p>
            <pre className="text-xs text-red-400 whitespace-pre-wrap break-all">
              {request.error}
            </pre>
          </div>
        )}
      </div>

      {/* ── Bottom: arguments & response ─────────────────────────────── */}
      <SplitPane argsJson={argsJson} responseJson={responseJson} />
    </div>
  );
}

function MetaField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}): React.JSX.Element {
  const valueClass = mono ? "text-foreground" : "text-foreground";
  return (
    <div className="flex items-center gap-1.5 text-[11px]">
      <span className="text-muted-foreground">{label}:</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}

const SQL_KEYWORDS =
  /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|INTO|VALUES|SET|ORDER\s+BY|GROUP\s+BY|HAVING|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|NOT|IN|IS|NULL|AS|LIKE|BETWEEN|EXISTS|DISTINCT|LIMIT|OFFSET|DESC|ASC|CREATE|DROP|ALTER|TABLE|INDEX|PRIMARY|KEY|FOREIGN|REFERENCES|CONSTRAINT|DEFAULT|CHECK|UNIQUE|CASCADE|REPLACE|CONFLICT|COUNT|SUM|AVG|MIN|MAX|CASE|WHEN|THEN|ELSE|END|UNION|ALL|TOP)\b/gi;
const SQL_STRINGS = /'[^']*'/g;
const SQL_WILDCARDS = /(?<!=)\*(?!=)/g;
const SQL_PARENS = /[()]/g;
const SQL_OPERATORS = /(?<!=)(=|!=|<>|>=|<=|>(?!=)|<(?!=))(?!=)/g;

function highlightSql(sql: string): React.JSX.Element[] {
  type Token = {
    type: "keyword" | "string" | "wildcard" | "paren" | "operator" | "text";
    value: string;
    index: number;
  };
  const tokens: Token[] = [];

  for (const m of sql.matchAll(SQL_KEYWORDS))
    tokens.push({ type: "keyword", value: m[0], index: m.index! });
  for (const m of sql.matchAll(SQL_STRINGS))
    tokens.push({ type: "string", value: m[0], index: m.index! });
  for (const m of sql.matchAll(SQL_WILDCARDS))
    tokens.push({ type: "wildcard", value: m[0], index: m.index! });
  for (const m of sql.matchAll(SQL_PARENS))
    tokens.push({ type: "paren", value: m[0], index: m.index! });
  for (const m of sql.matchAll(SQL_OPERATORS))
    tokens.push({ type: "operator", value: m[0], index: m.index! });

  tokens.sort((a, b) => a.index - b.index);

  const parts: React.JSX.Element[] = [];
  let cursor = 0;

  for (const tok of tokens) {
    if (tok.index < cursor) continue;
    if (tok.index > cursor)
      parts.push(
        <span key={`t-${cursor}`}>{sql.slice(cursor, tok.index)}</span>,
      );

    const cls =
      tok.type === "keyword"
        ? "text-purple-400 font-semibold"
        : tok.type === "string"
          ? "text-green-400"
          : tok.type === "wildcard"
            ? "text-amber-400"
            : tok.type === "paren"
              ? "text-sky-400"
              : tok.type === "operator"
                ? "text-orange-400"
                : "";

    parts.push(
      <span key={`h-${tok.index}`} className={cls}>
        {tok.value}
      </span>,
    );
    cursor = tok.index + tok.value.length;
  }

  if (cursor < sql.length)
    parts.push(<span key={`t-${cursor}`}>{sql.slice(cursor)}</span>);
  return parts;
}

function CommandBlock({
  type,
  command,
}: {
  type: string;
  command: string;
}): React.JSX.Element {
  const isSql = type.startsWith("SQLite");
  return (
    <div className="bg-secondary/30 border border-border rounded-md px-3 py-2 space-y-1">
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        {type}
      </span>
      <pre className="text-xs text-foreground whitespace-pre-wrap break-all leading-relaxed">
        {isSql ? highlightSql(command) : command}
      </pre>
    </div>
  );
}

const SPLIT_DEFAULT = 50;
const SPLIT_MIN = 20;
const SPLIT_MAX = 80;

const STACK_BREAKPOINT = 500;

function SplitPane({
  argsJson,
  responseJson,
}: {
  argsJson: string;
  responseJson: string;
}): React.JSX.Element {
  const [splitPercent, setSplitPercent] = useState(SPLIT_DEFAULT);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const isStacked = containerWidth > 0 && containerWidth < STACK_BREAKPOINT;

  const rafRef = useRef(0);
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        for (const entry of entries) {
          setContainerWidth(entry.contentRect.width);
          setContainerHeight(entry.contentRect.height);
        }
      });
    });
    observer.observe(node);
    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, []);

  const containerSize = isStacked ? containerHeight : containerWidth;
  const pixelSize = (containerSize * splitPercent) / 100;
  const minPx = (containerSize * SPLIT_MIN) / 100;
  const maxPx = (containerSize * SPLIT_MAX) / 100;
  const resetPx = (containerSize * SPLIT_DEFAULT) / 100;

  const handleSizeChange = useCallback(
    (newPx: number) => {
      if (containerSize > 0) setSplitPercent((newPx / containerSize) * 100);
    },
    [containerSize],
  );

  const { handleMouseDown } = useResizeHandle({
    width: pixelSize,
    minWidth: minPx,
    maxWidth: maxPx,
    resetWidth: resetPx,
    direction: isStacked ? "down" : "right",
    onWidthChange: handleSizeChange,
  });

  if (isStacked) {
    return (
      <div ref={containerRef} className="flex-1 min-h-0 flex flex-col">
        <div style={{ height: `${splitPercent}%` }} className="min-h-0">
          <JsonPane label="Arguments" content={argsJson} />
        </div>
        <div
          className="relative h-1 shrink-0 cursor-row-resize group"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-border/60 group-hover:bg-primary/50 transition-colors" />
        </div>
        <div style={{ height: `${100 - splitPercent}%` }} className="min-h-0">
          <JsonPane label="Response" content={responseJson} />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 min-h-0 flex">
      <div style={{ width: `${splitPercent}%` }} className="min-w-0">
        <JsonPane label="Arguments" content={argsJson} />
      </div>
      <div
        className="relative w-1 shrink-0 cursor-col-resize group"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-border/60 group-hover:bg-primary/50 transition-colors" />
      </div>
      <div style={{ width: `${100 - splitPercent}%` }} className="min-w-0">
        <JsonPane label="Response" content={responseJson} />
      </div>
    </div>
  );
}

type ViewMode = "raw" | "parsed";

function JsonPane({
  label,
  content,
}: {
  label: string;
  content: string;
}): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const isLargeContent = content.length > LARGE_JSON_THRESHOLD;
  const [viewMode, setViewMode] = useState<ViewMode>(
    isLargeContent ? "raw" : "parsed",
  );
  const activeThemeId = useThemeStore((s) => s.activeThemeId);
  const appTheme = useMemo(
    () => THEMES.find((t) => t.id === activeThemeId),
    [activeThemeId],
  );

  useEffect(() => {
    if (appTheme) defineAppMonacoTheme(THEME_ID, appTheme);
  }, [appTheme]);

  const parsedData = useMemo(() => {
    if (isLargeContent) return null;
    try {
      return JSON.parse(content);
    } catch {
      return null;
    }
  }, [content, isLargeContent]);

  function handleCopy(): void {
    void navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const CopyIcon = copied ? Check : Copy;
  const copyLabel = copied ? "Copied!" : `Copy ${label.toLowerCase()}`;
  const sizeLabel =
    content.length > LARGE_JSON_THRESHOLD
      ? `${(content.length / 1024).toFixed(1)} KB`
      : null;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Pane header */}
      <div className="shrink-0 flex items-center justify-between px-3 h-9 border-b border-border/40 bg-secondary/20">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
          {sizeLabel && (
            <span className="text-[10px] text-muted-foreground bg-secondary/60 px-1 py-0.5 rounded">
              {sizeLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Tooltip content={copyLabel} side="bottom">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <CopyIcon size={12} />
              {copied ? "Copied" : "Copy"}
            </button>
          </Tooltip>
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            hasParsed={parsedData !== null}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {viewMode === "parsed" && parsedData !== null ? (
          <ParsedJsonView data={parsedData} />
        ) : (
          <MonacoJsonView content={content} />
        )}
      </div>
    </div>
  );
}

function ViewModeToggle({
  viewMode,
  onViewModeChange,
  hasParsed,
}: {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  hasParsed: boolean;
}): React.JSX.Element {
  const activeClass = "text-foreground bg-secondary/80";
  const inactiveClass = "text-muted-foreground hover:text-foreground";

  return (
    <div className="flex items-center rounded-sm border border-border/40 overflow-hidden">
      <button
        onClick={() => onViewModeChange("raw")}
        className={`px-1.5 py-0.5 text-[10px] font-medium transition-colors cursor-pointer ${viewMode === "raw" ? activeClass : inactiveClass}`}
      >
        Raw
      </button>
      <button
        onClick={() => onViewModeChange("parsed")}
        disabled={!hasParsed}
        className={`px-1.5 py-0.5 text-[10px] font-medium transition-colors border-l border-border/40 ${
          !hasParsed
            ? "text-muted-foreground/40 cursor-not-allowed"
            : viewMode === "parsed"
              ? `${activeClass} cursor-pointer`
              : `${inactiveClass} cursor-pointer`
        }`}
      >
        Parsed
      </button>
    </div>
  );
}

const LazyEditor = lazy(() =>
  Promise.all([import("@monaco-editor/react"), import("monaco-editor")]).then(
    ([editorModule, monacoModule]) => {
      editorModule.loader.config({ monaco: monacoModule });
      return { default: editorModule.default };
    },
  ),
);

const MonacoJsonView = memo(function MonacoJsonView({
  content,
}: {
  content: string;
}): React.JSX.Element {
  return (
    <div className="json-monaco-wrap h-full">
      <Suspense
        fallback={<AppInlineLoader message="Loading editor..." size={14} className="h-full" />}
      >
        <ErrorBoundary componentName="JSON Editor">
          <LazyEditor
            value={content}
            language="json"
            theme={THEME_ID}
            options={{
              readOnly: true,
              domReadOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 12,
              lineNumbers: "off",
              renderLineHighlight: "none",
              contextmenu: false,
              folding: true,
              wordWrap: "on",
              scrollbar: APP_MONACO_SCROLLBAR_OPTIONS,
              overviewRulerLanes: 0,
              hideCursorInOverviewRuler: true,
              overviewRulerBorder: false,
              guides: { indentation: false },
              padding: { top: 8, bottom: 8 },
            }}
          />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
});

const JSON_VIEW_STYLES: StyleProps = {
  container: "jv-container",
  basicChildStyle: "jv-child",
  label: "jv-key",
  clickableLabel: "jv-key jv-clickable",
  nullValue: "jv-null",
  undefinedValue: "jv-undefined",
  numberValue: "jv-number",
  stringValue: "jv-string",
  booleanValue: "jv-boolean",
  otherValue: "jv-other",
  punctuation: "jv-bracket",
  expandIcon: "jv-expand-icon",
  collapseIcon: "jv-collapse-icon",
  collapsedContent: "jv-collapsed",
  childFieldsContainer: "jv-fields",
  noQuotesForStringValues: false,
  quotesForFieldNames: false,
  stringifyStringValues: false,
  ariaLables: { collapseJson: "Collapse", expandJson: "Expand" },
};

const DEFAULT_EXPAND_DEPTH = 3;
const shouldExpandNode = (level: number): boolean =>
  level < DEFAULT_EXPAND_DEPTH;

const ParsedJsonView = memo(function ParsedJsonView({
  data,
}: {
  data: object;
}): React.JSX.Element {
  return (
    <div className="h-full overflow-auto p-2 text-xs">
      <JsonView
        data={data}
        shouldExpandNode={shouldExpandNode}
        clickToExpandNode
        style={JSON_VIEW_STYLES}
      />
    </div>
  );
});
