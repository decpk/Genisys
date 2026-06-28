import {
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  Check,
  X,
  Play,
  Eye,
  RefreshCw,
  PlusCircle,
  Settings2,
} from "lucide-react";
import { AppInlineLoader } from "@/components/AppLoader";

import { Tooltip } from "@/components/Tooltip";
import { useResizeHandle } from "@/hooks/useResizeHandle";
import { useThemeStore } from "@/store/theme-store";
import { THEMES } from "@/themes";
import { APP_MONACO_SCROLLBAR_OPTIONS, defineAppMonacoTheme } from "@/lib/monaco-theme";

// ── Types ──────────────────────────────────────────────────────────────

interface StoreStatePanelProps {
  storeName: string;
  state: Record<string, unknown>;
  actions: Record<string, (...args: unknown[]) => unknown>;
  onUpdate: (path: string[], value: unknown) => void;
  onDelete: (path: string[]) => void;
  actionsHeight: number;
  onActionsHeightChange: (h: number) => void;
}

// ── Action categorization ──────────────────────────────────────────────

type ActionCategory = "create" | "read" | "update" | "delete" | "other";

const CATEGORY_PREFIXES: Record<ActionCategory, readonly string[]> = {
  create: ["add", "create", "insert", "import", "ensure", "init"],
  read: [
    "load",
    "get",
    "fetch",
    "select",
    "find",
    "is",
    "has",
    "check",
    "consume",
  ],
  update: [
    "set",
    "update",
    "toggle",
    "move",
    "reorder",
    "patch",
    "save",
    "preview",
    "revert",
    "replace",
  ],
  delete: [
    "remove",
    "delete",
    "clear",
    "reset",
    "deactivate",
    "destroy",
    "drop",
  ],
  other: [],
};

const CATEGORY_META: Record<
  ActionCategory,
  {
    label: string;
    icon: React.ComponentType<{ size: number; className?: string }>;
    accentBorder: string;
    headerBg: string;
    headerText: string;
    headerBorder: string;
    dotColor: string;
    btnBorder: string;
    btnHoverBg: string;
    btnText: string;
    btnRunningBg: string;
    btnRunningBorder: string;
    btnRunningText: string;
  }
> = {
  create: {
    label: "Create",
    icon: PlusCircle,
    accentBorder: "border-l-emerald-500",
    headerBg: "bg-emerald-500/5",
    headerText: "text-emerald-400",
    headerBorder: "border-emerald-500/10",
    dotColor: "bg-emerald-400",
    btnBorder: "border-emerald-500/20",
    btnHoverBg: "hover:bg-emerald-500/10",
    btnText: "text-emerald-400",
    btnRunningBg: "bg-emerald-500/15",
    btnRunningBorder: "border-emerald-500/30",
    btnRunningText: "text-emerald-300",
  },
  read: {
    label: "Read",
    icon: Eye,
    accentBorder: "border-l-blue-500",
    headerBg: "bg-blue-500/5",
    headerText: "text-blue-400",
    headerBorder: "border-blue-500/10",
    dotColor: "bg-blue-400",
    btnBorder: "border-blue-500/20",
    btnHoverBg: "hover:bg-blue-500/10",
    btnText: "text-blue-400",
    btnRunningBg: "bg-blue-500/15",
    btnRunningBorder: "border-blue-500/30",
    btnRunningText: "text-blue-300",
  },
  update: {
    label: "Update",
    icon: RefreshCw,
    accentBorder: "border-l-amber-500",
    headerBg: "bg-amber-500/5",
    headerText: "text-amber-400",
    headerBorder: "border-amber-500/10",
    dotColor: "bg-amber-400",
    btnBorder: "border-amber-500/20",
    btnHoverBg: "hover:bg-amber-500/10",
    btnText: "text-amber-400",
    btnRunningBg: "bg-amber-500/15",
    btnRunningBorder: "border-amber-500/30",
    btnRunningText: "text-amber-300",
  },
  delete: {
    label: "Danger",
    icon: Trash2,
    accentBorder: "border-l-red-500",
    headerBg: "bg-red-500/5",
    headerText: "text-red-400",
    headerBorder: "border-red-500/10",
    dotColor: "bg-red-400",
    btnBorder: "border-red-500/20",
    btnHoverBg: "hover:bg-red-500/10",
    btnText: "text-red-400",
    btnRunningBg: "bg-red-500/15",
    btnRunningBorder: "border-red-500/30",
    btnRunningText: "text-red-300",
  },
  other: {
    label: "Other",
    icon: Settings2,
    accentBorder: "border-l-muted-foreground/40",
    headerBg: "bg-secondary/20",
    headerText: "text-muted-foreground",
    headerBorder: "border-border/15",
    dotColor: "bg-muted-foreground/60",
    btnBorder: "border-border/60",
    btnHoverBg: "hover:bg-secondary/60",
    btnText: "text-foreground/80",
    btnRunningBg: "bg-primary/10",
    btnRunningBorder: "border-primary/30",
    btnRunningText: "text-primary",
  },
};

function categorizeAction(name: string): ActionCategory {
  const lower = name.toLowerCase();
  for (const [category, prefixes] of Object.entries(CATEGORY_PREFIXES) as [
    ActionCategory,
    readonly string[],
  ][]) {
    if (category === "other") continue;
    if (prefixes.some((p) => lower.startsWith(p))) return category;
  }
  return "other";
}

function groupActions(
  actions: Record<string, (...args: unknown[]) => unknown>,
): {
  category: ActionCategory;
  entries: [string, (...args: unknown[]) => unknown][];
}[] {
  const groups = new Map<
    ActionCategory,
    [string, (...args: unknown[]) => unknown][]
  >();
  for (const [name, fn] of Object.entries(actions)) {
    const cat = categorizeAction(name);
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push([name, fn]);
  }
  const order: ActionCategory[] = [
    "read",
    "create",
    "update",
    "delete",
    "other",
  ];
  return order
    .filter((c) => groups.has(c))
    .map((c) => ({ category: c, entries: groups.get(c)! }));
}

// ── Type badge helper ──────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  string: "text-green-400",
  number: "text-blue-400",
  boolean: "text-yellow-400",
  null: "text-red-400",
  undefined: "text-red-400/60",
  object: "text-purple-400",
  array: "text-purple-400",
};

function getTypeLabel(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function formatValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

// ── Inline value editor ────────────────────────────────────────────────

function InlineEditor({
  value,
  onSave,
  onCancel,
}: {
  value: unknown;
  onSave: (v: unknown) => void;
  onCancel: () => void;
}): React.JSX.Element {
  const [raw, setRaw] = useState(() => {
    if (typeof value === "string") return value;
    return JSON.stringify(value);
  });
  const isString = typeof value === "string";

  const handleSave = (): void => {
    if (isString) {
      onSave(raw);
      return;
    }
    try {
      onSave(JSON.parse(raw));
    } catch {
      onSave(raw);
    }
  };

  return (
    <span className="inline-flex items-center gap-1 ml-1">
      <input
        autoFocus
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          }
        }}
        className="px-1.5 py-0.5 text-[11px] bg-secondary border border-transparent rounded min-w-[80px] max-w-[300px] text-foreground focus:outline-none focus:border-input focus:ring-1 focus:ring-ring/20"
      />
      <button
        onClick={handleSave}
        className="text-green-400 hover:text-green-300 cursor-pointer"
      >
        <Check size={12} />
      </button>
      <button
        onClick={onCancel}
        className="text-muted-foreground hover:text-foreground cursor-pointer"
      >
        <X size={12} />
      </button>
    </span>
  );
}

// ── Add key dialog ─────────────────────────────────────────────────────

function AddKeyForm({
  onAdd,
  onCancel,
}: {
  onAdd: (key: string, value: unknown) => void;
  onCancel: () => void;
}): React.JSX.Element {
  const [key, setKey] = useState("");
  const [val, setVal] = useState("");

  const handleSubmit = (): void => {
    if (!key.trim()) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(val);
    } catch {
      parsed = val;
    }
    onAdd(key.trim(), parsed);
  };

  return (
    <div className="flex items-center gap-1 ml-4 my-1">
      <input
        autoFocus
        placeholder="key"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        className="px-1.5 py-0.5 text-[11px] bg-secondary border border-transparent rounded w-[80px] text-foreground focus:outline-none focus:border-input focus:ring-1 focus:ring-ring/20"
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
          if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          }
        }}
      />
      <input
        placeholder="value"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="px-1.5 py-0.5 text-[11px] bg-secondary border border-transparent rounded w-[120px] text-foreground focus:outline-none focus:border-input focus:ring-1 focus:ring-ring/20"
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
          if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          }
        }}
      />
      <button
        onClick={handleSubmit}
        className="text-green-400 hover:text-green-300 cursor-pointer"
      >
        <Check size={12} />
      </button>
      <button
        onClick={onCancel}
        className="text-muted-foreground hover:text-foreground cursor-pointer"
      >
        <X size={12} />
      </button>
    </div>
  );
}

// ── JSON tree node (memo'd, collapsed by default) ──────────────────────

const JsonNode = memo(function JsonNode({
  keyName,
  value,
  path,
  onUpdate,
  onDelete,
  depth = 0,
}: {
  keyName: string;
  value: unknown;
  path: string[];
  onUpdate: (path: string[], value: unknown) => void;
  onDelete: (path: string[]) => void;
  depth?: number;
}): React.JSX.Element {
  const [expanded, setExpanded] = useState(depth === 0);
  const [editing, setEditing] = useState(false);
  const [addingKey, setAddingKey] = useState(false);

  const typeLabel = getTypeLabel(value);
  const isExpandable = typeLabel === "object" || typeLabel === "array";
  const colorClass = TYPE_COLORS[typeLabel] ?? "text-foreground";

  const handleAddKey = useCallback(
    (newKey: string, newValue: unknown) => {
      onUpdate([...path, newKey], newValue);
      setAddingKey(false);
    },
    [path, onUpdate],
  );

  return (
    <div className="select-none">
      <div
        className="group flex items-center gap-1 px-2 py-0.5 hover:bg-secondary/40 rounded-sm"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {/* Expand/collapse arrow */}
        {isExpandable ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <ChevronRight
              size={12}
              className={`transition-transform ${expanded ? "rotate-90" : ""}`}
            />
          </button>
        ) : (
          <span className="w-3 shrink-0" />
        )}

        {/* Key name */}
        <span className="text-[11px] text-foreground/80 shrink-0">
          {keyName}:
        </span>

        {/* Value display or editor */}
        {editing && !isExpandable ? (
          <InlineEditor
            value={value}
            onSave={(v) => {
              onUpdate(path, v);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        ) : isExpandable ? (
          <span className="text-[10px] text-muted-foreground ml-1">
            {typeLabel === "array"
              ? `Array(${(value as unknown[]).length})`
              : `{${Object.keys(value as Record<string, unknown>).length}}`}
          </span>
        ) : (
          <span
            className={`text-[11px] ml-1 truncate max-w-[400px] ${colorClass}`}
          >
            {formatValue(value)}
          </span>
        )}

        {/* Type badge */}
        <span className="text-[9px] text-muted-foreground/50 ml-auto mr-1 shrink-0 opacity-0 group-hover:opacity-100">
          {typeLabel}
        </span>

        {/* Actions */}
        <span className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 shrink-0">
          {!isExpandable && (
            <Tooltip content="Edit value" side="top">
              <button
                onClick={() => setEditing(true)}
                className="text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
              >
                <Pencil size={10} />
              </button>
            </Tooltip>
          )}
          {isExpandable && (
            <Tooltip content="Add key" side="top">
              <button
                onClick={() => {
                  setExpanded(true);
                  setAddingKey(true);
                }}
                className="text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
              >
                <Plus size={10} />
              </button>
            </Tooltip>
          )}
          <Tooltip content="Delete" side="top">
            <button
              onClick={() => onDelete(path)}
              className="text-muted-foreground hover:text-red-400 p-0.5 cursor-pointer"
            >
              <Trash2 size={10} />
            </button>
          </Tooltip>
        </span>
      </div>

      {/* Children (rendered lazily on expand) */}
      {isExpandable && expanded && (
        <div>
          {Object.entries(value as Record<string, unknown>).map(
            ([childKey, childVal]) => (
              <JsonNode
                key={childKey}
                keyName={childKey}
                value={childVal}
                path={[...path, childKey]}
                onUpdate={onUpdate}
                onDelete={onDelete}
                depth={depth + 1}
              />
            ),
          )}
          {addingKey && (
            <AddKeyForm
              onAdd={handleAddKey}
              onCancel={() => setAddingKey(false)}
            />
          )}
        </div>
      )}
    </div>
  );
});

// ── Action button for zero-arg store functions ─────────────────────────

function ActionButton({
  name,
  fn,
  category,
}: {
  name: string;
  fn: (...args: unknown[]) => unknown;
  category: ActionCategory;
}): React.JSX.Element {
  const [running, setRunning] = useState(false);
  const meta = CATEGORY_META[category];
  const argCount = fn.length;

  const handleClick = (): void => {
    if (argCount > 0) return;
    setRunning(true);
    try {
      fn();
    } catch (err) {
      console.error(`[StoreInspector] Action "${name}" failed:`, err);
    } finally {
      setTimeout(() => setRunning(false), 300);
    }
  };

  const button = (
    <button
      onClick={handleClick}
      disabled={argCount > 0 || running}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] rounded-md border transition-colors cursor-pointer ${
        argCount > 0
          ? "border-border/40 text-muted-foreground/50 cursor-not-allowed"
          : running
            ? `${meta.btnRunningBg} ${meta.btnRunningBorder} ${meta.btnRunningText}`
            : `${meta.btnBorder} ${meta.btnText} ${meta.btnHoverBg}`
      }`}
    >
      <Play size={10} />
      {name}
      {argCount > 0 && (
        <span className="text-[9px] text-muted-foreground/40">
          ({argCount} args)
        </span>
      )}
    </button>
  );

  if (argCount > 0) {
    return (
      <Tooltip
        content={`Requires ${argCount} argument${argCount > 1 ? "s" : ""} — cannot be called from inspector`}
      >
        {button}
      </Tooltip>
    );
  }

  return button;
}

// ── Category section for grouped actions ───────────────────────────────

const ActionCategorySection = memo(function ActionCategorySection({
  category,
  entries,
}: {
  category: ActionCategory;
  entries: [string, (...args: unknown[]) => unknown][];
}): React.JSX.Element {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;

  return (
    <div
      className={`border-l-2 ${meta.accentBorder} rounded-r-lg border border-l-0 ${meta.headerBorder} overflow-hidden bg-card/50`}
    >
      <div
        className={`${meta.headerBg} px-3 py-2 flex items-center gap-2 border-b ${meta.headerBorder}`}
      >
        <Icon size={13} className={meta.headerText} />
        <span className={`text-[11px] font-semibold ${meta.headerText}`}>
          {meta.label}
        </span>
        <span className="text-[10px] text-muted-foreground/40 ml-auto">
          {entries.length}
        </span>
      </div>
      <div className="px-2 py-2 flex flex-wrap gap-1">
        {entries.map(([name, fn]) => (
          <ActionButton key={name} name={name} fn={fn} category={category} />
        ))}
      </div>
    </div>
  );
});

// ── View mode toggle (Raw / Parsed) ────────────────────────────────────

type ViewMode = "raw" | "parsed";

function ViewModeToggle({
  viewMode,
  onViewModeChange,
}: {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
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
        className={`px-1.5 py-0.5 text-[10px] font-medium transition-colors border-l border-border/40 cursor-pointer ${viewMode === "parsed" ? activeClass : inactiveClass}`}
      >
        Parsed
      </button>
    </div>
  );
}

// ── Monaco JSON viewer (raw) ───────────────────────────────────────────

const STORE_THEME_ID = "store-inspector-theme";

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
  const activeThemeId = useThemeStore((s) => s.activeThemeId);
  const appTheme = useMemo(
    () => THEMES.find((t) => t.id === activeThemeId),
    [activeThemeId],
  );

  useEffect(() => {
    if (appTheme) defineAppMonacoTheme(STORE_THEME_ID, appTheme);
  }, [appTheme]);

  return (
    <div className="h-full">
      <Suspense
        fallback={<AppInlineLoader message="Loading editor..." size={14} className="h-full" />}
      >
        <ErrorBoundary componentName="JSON Editor">
          <LazyEditor
            value={content}
            language="json"
            theme={STORE_THEME_ID}
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

// ── Main StoreStatePanel ───────────────────────────────────────────────

const DEFAULT_ACTIONS_HEIGHT = 280;
const MIN_ACTIONS_HEIGHT = 120;
const MAX_ACTIONS_HEIGHT = 600;

export const StoreStatePanel = memo(function StoreStatePanel({
  storeName,
  state,
  actions,
  onUpdate,
  onDelete,
  actionsHeight,
  onActionsHeightChange,
}: StoreStatePanelProps): React.JSX.Element {
  const stateEntries = Object.entries(state);
  const actionEntries = Object.entries(actions);
  const groupedActions = useMemo(() => groupActions(actions), [actions]);
  const [viewMode, setViewMode] = useState<ViewMode>("parsed");
  const rawJson = useMemo(() => JSON.stringify(state, null, 2), [state]);

  const { handleMouseDown } = useResizeHandle({
    width: actionsHeight,
    minWidth: MIN_ACTIONS_HEIGHT,
    maxWidth: MAX_ACTIONS_HEIGHT,
    resetWidth: DEFAULT_ACTIONS_HEIGHT,
    direction: "up",
    onWidthChange: onActionsHeightChange,
  });

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-border/40 px-4 h-10 flex items-center justify-between bg-card">
        <span className="text-xs font-medium text-foreground">{storeName}</span>
        <div className="flex items-center gap-3">
          <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>{stateEntries.length} state</span>
            <span>·</span>
            <span>{actionEntries.length} actions</span>
          </div>
        </div>
      </div>

      {/* State section (fills remaining space above actions) */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-hidden">
          {viewMode === "raw" ? (
            <MonacoJsonView content={rawJson} />
          ) : stateEntries.length === 0 ? (
            <div className="px-4 py-3 text-[11px] text-muted-foreground/60">
              No state properties
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              {stateEntries.map(([key, value]) => (
                <JsonNode
                  key={key}
                  keyName={key}
                  value={value}
                  path={[key]}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  depth={0}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Drag handle */}
      <div
        onMouseDown={handleMouseDown}
        className="shrink-0 h-1.5 cursor-row-resize group relative"
      >
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-border/60 group-hover:bg-primary/50 transition-colors" />
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-8 h-1 rounded-full bg-border/40 group-hover:bg-primary/40 transition-colors" />
      </div>

      {/* Actions section (resizable from top) */}
      <div
        className="shrink-0 flex flex-col overflow-hidden"
        style={{ height: `${actionsHeight}px` }}
      >
        <div className="px-4 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider bg-secondary/30 shrink-0 border-b border-border/20">
          Actions
        </div>
        <div className="flex-1 overflow-y-auto">
          {actionEntries.length === 0 ? (
            <div className="px-4 py-3 text-[11px] text-muted-foreground/60">
              No actions
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {groupedActions.map(({ category, entries }) => (
                <ActionCategorySection
                  key={category}
                  category={category}
                  entries={entries}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
