import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import {
  Database,
  Play,
  Table,
  Search,
  ChevronRight,
  Info,
  Trash2,
  TableProperties,
  BookOpen,
  X,
} from 'lucide-react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'

import { useThemeStore } from '@/store/theme-store'
import { THEMES } from '@/themes'
import { APP_MONACO_SCROLLBAR_OPTIONS, defineAppMonacoTheme } from '@/lib/monaco-theme'
import { ResizablePanel } from '@/components/ResizablePanel'
import { SidebarLayout } from '@/components/ui/sidebar-layout'
import { SIDE_PANEL_SURFACE_CLASS } from '@/lib/panel-classes'
import { SectionHeader } from '@/components/ui/section-header'
import { AppLoaderGlyph } from '@/components/AppLoader'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Tooltip } from '@/components/Tooltip'
import { useSettingsStore } from '@/store/settings-store'
import { useResizeHandle } from '@/hooks'

import { CATEGORY_LABELS, CATEGORY_COLORS } from './DbExplorer.constants'
import type { SavedQuery, QueryResult } from './DbExplorer.types'
import { useDbExplorer } from './useDbExplorer'

loader.config({ monaco })

const THEME_ID = 'db-explorer-theme'

export function DbExplorer(): React.JSX.Element {
  const {
    query,
    setQuery,
    result,
    isRunning,
    tables,
    activeQueryId,
    savedQueries,
    loadTables,
    runCurrentQuery,
    runSavedQuery,
    selectTableQuery,
    describeTable,
  } = useDbExplorer()

  const sidebarPosition = useSettingsStore((s) => s.sidebarPosition)
  const [searchFilter, setSearchFilter] = useState('')

  useEffect(() => {
    loadTables()
  }, [loadTables])

  const filteredQueries = useMemo(() => {
    if (!searchFilter.trim()) return savedQueries
    const q = searchFilter.toLowerCase()
    return savedQueries.filter(
      (sq) =>
        sq.label.toLowerCase().includes(q) ||
        sq.description.toLowerCase().includes(q) ||
        sq.category.toLowerCase().includes(q)
    )
  }, [savedQueries, searchFilter])

  const groupedQueries = useMemo(() => {
    const groups: Record<string, SavedQuery[]> = {}
    for (const sq of filteredQueries) {
      ;(groups[sq.category] ??= []).push(sq)
    }
    return groups
  }, [filteredQueries])

  const sidebar = (
    <ResizablePanel
      as="aside"
      defaultWidth={300}
      minWidth={240}
      maxWidth={500}
      position={sidebarPosition}
      className={SIDE_PANEL_SURFACE_CLASS}
      expandTitle="Expand sidebar"
      collapseTitle="Collapse sidebar"
    >
      <div className="h-full flex flex-col">
        <div className="shrink-0 border-b border-border/40 px-3 py-2.5 space-y-2">
          <SectionHeader icon={Database} title="DB Explorer" />

          <div className="relative">
            <Search
              size={12}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Filter queries..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-7 pr-2 py-1 text-[11px] bg-secondary/40 border border-transparent rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-input focus:ring-1 focus:ring-ring/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Tables section */}
          {tables.length > 0 && (
            <CollapsibleSection title="Tables" defaultOpen>
              {tables.map((table) => (
                <TableRow
                  key={table}
                  name={table}
                  onSelect={() => selectTableQuery(table)}
                  onDescribe={() => describeTable(table)}
                />
              ))}
            </CollapsibleSection>
          )}

          {/* Saved queries by category */}
          {Object.entries(groupedQueries).map(([category, queries]) => (
            <CollapsibleSection
              key={category}
              title={CATEGORY_LABELS[category] ?? category}
              defaultOpen
            >
              {queries.map((sq) => (
                <SavedQueryRow
                  key={sq.id}
                  query={sq}
                  isActive={activeQueryId === sq.id}
                  onRun={() => runSavedQuery(sq)}
                />
              ))}
            </CollapsibleSection>
          ))}
        </div>
      </div>
    </ResizablePanel>
  )

  return (
    <SidebarLayout sidebarPosition={sidebarPosition} sidebar={sidebar}>
      <div className="h-full flex flex-col min-w-0">
        {/* SQL Editor */}
        <QueryEditor
          query={query}
          onQueryChange={setQuery}
          onRun={runCurrentQuery}
          isRunning={isRunning}
        />

        {/* Results */}
        <div className="flex-1 min-h-0 overflow-auto">
          {isRunning ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm gap-2">
              <AppLoaderGlyph size={16} />
              Running query...
            </div>
          ) : result ? (
            <QueryResultView result={result} />
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-xs">
              Run a query or select a saved query to view results
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  )
}

// ── Collapsible Section ──

function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}): React.JSX.Element {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-border/40">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ChevronRight
          size={12}
          className={`transition-transform ${open ? 'rotate-90' : ''}`}
        />
        {title}
      </button>
      {open && <div>{children}</div>}
    </div>
  )
}

// ── Table Row ──

function TableRow({
  name,
  onSelect,
  onDescribe,
}: {
  name: string
  onSelect: () => void
  onDescribe: () => void
}): React.JSX.Element {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1 hover:bg-secondary/50 group cursor-pointer"
      onClick={onSelect}
    >
      <Table size={12} className="text-muted-foreground shrink-0" />
      <span className="text-xs text-foreground truncate flex-1">{name}</span>
      <Tooltip content="SELECT * FROM table" side="top">
        <IconButton
          variant="ghost"
          size="xs"
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            onSelect();
          }}
          className="opacity-0 group-hover:opacity-100"
        >
          <TableProperties size={12} />
        </IconButton>
      </Tooltip>
      <Tooltip content="Describe table" side="top">
        <IconButton
          variant="ghost"
          size="xs"
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            onDescribe();
          }}
          className="opacity-0 group-hover:opacity-100"
        >
          <Info size={12} />
        </IconButton>
      </Tooltip>
    </div>
  );
}

// ── Saved Query Row ──

function SavedQueryRow({
  query,
  isActive,
  onRun,
}: {
  query: SavedQuery
  isActive: boolean
  onRun: () => void
}): React.JSX.Element {
  const categoryColor = CATEGORY_COLORS[query.category] ?? 'text-muted-foreground'
  const icon =
    query.category === 'delete' ? (
      <Trash2 size={12} className={categoryColor} />
    ) : query.category === 'schema' ? (
      <BookOpen size={12} className={categoryColor} />
    ) : (
      <Play size={12} className={categoryColor} />
    )

  return (
    <button
      onClick={onRun}
      className={`w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors cursor-pointer ${
        isActive
          ? 'bg-primary/10 border-l-2 border-l-primary'
          : 'border-l-2 border-l-transparent hover:bg-secondary/50'
      }`}
    >
      {icon}
      <div className="min-w-0 flex-1">
        <div className="text-xs text-foreground truncate">{query.label}</div>
        <div className="text-[10px] text-muted-foreground truncate">{query.description}</div>
      </div>
    </button>
  )
}

// ── Query Editor ──

/** Extract the SQL statement at the cursor position from the editor. */
function getQueryAtCursor(editor: monaco.editor.IStandaloneCodeEditor): string {
  const model = editor.getModel()
  if (!model) return editor.getValue()

  const fullText = model.getValue()
  const position = editor.getPosition()
  if (!position) return fullText

  const offset = model.getOffsetAt(position)

  // Build a list of statement ranges split by ';'
  const statements: { start: number; end: number }[] = []
  let currentStart = 0

  for (let i = 0; i < fullText.length; i++) {
    if (fullText[i] === ';') {
      statements.push({ start: currentStart, end: i + 1 })
      currentStart = i + 1
    }
  }

  // Trailing text after the last semicolon
  if (currentStart < fullText.length && fullText.slice(currentStart).trim()) {
    statements.push({ start: currentStart, end: fullText.length })
  }

  if (statements.length === 0) return fullText.trim()

  // Find the statement that contains the cursor offset
  for (const stmt of statements) {
    if (offset >= stmt.start && offset <= stmt.end) {
      const text = fullText.slice(stmt.start, stmt.end).trim()
      if (text) return text
    }
  }

  // Fallback: cursor might be on whitespace between statements – pick the closest previous one
  for (let i = statements.length - 1; i >= 0; i--) {
    if (offset >= statements[i].end) {
      const text = fullText.slice(statements[i].start, statements[i].end).trim()
      if (text) return text
    }
  }

  return fullText.trim()
}

function QueryEditor({
  query,
  onQueryChange,
  onRun,
  isRunning,
}: {
  query: string
  onQueryChange: (val: string) => void
  onRun: (sql: string) => void
  isRunning: boolean
}): React.JSX.Element {
  const activeThemeId = useThemeStore((s) => s.activeThemeId)
  const appTheme = useMemo(() => THEMES.find((t) => t.id === activeThemeId), [activeThemeId])
  const editorFontSize = useSettingsStore((s) => s.editorFontSize)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    if (appTheme) defineAppMonacoTheme(THEME_ID, appTheme)
  }, [appTheme])

  const handleRun = useCallback(() => {
    if (editorRef.current) {
      onRun(getQueryAtCursor(editorRef.current))
    } else {
      onRun(query)
    }
  }, [onRun, query])

  return (
    <div className="shrink-0 border-b border-border/40">
      <div className="flex items-center justify-between px-3 h-9 bg-secondary/20 border-b border-border/40">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          SQL Query
        </span>
        <Button
          variant="subtle"
          size="xs"
          onClick={handleRun}
          disabled={isRunning || !query.trim()}
        >
          {isRunning ? (
            <AppLoaderGlyph size={12} />
          ) : (
            <Play size={12} />
          )}
          Run
        </Button>
      </div>
      <div className="h-[140px] min-h-[80px] max-h-[200px]">
        <Editor
          value={query}
          onChange={(val) => onQueryChange(val ?? "")}
          language="sql"
          theme={THEME_ID}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: editorFontSize,
            lineNumbers: "on",
            renderLineHighlight: "line",
            contextmenu: false,
            folding: false,
            wordWrap: "on",
            scrollbar: APP_MONACO_SCROLLBAR_OPTIONS,
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            guides: { indentation: false },
            padding: { top: 8, bottom: 8 },
          }}
          onMount={(editor) => {
            editorRef.current = editor
            editor.addCommand(
              monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
              () => {
                onRun(getQueryAtCursor(editor));
              },
            );
          }}
        />
      </div>
    </div>
  );
}

// ── Query Result View ──

function QueryResultView({ result }: { result: QueryResult }): React.JSX.Element {
  if (!result.success) {
    return (
      <div className="p-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
          <p className="text-[11px] font-medium text-red-500 mb-1">
            Query Error
          </p>
          <pre className="text-xs text-red-400 whitespace-pre-wrap break-all">
            {result.error}
          </pre>
        </div>
      </div>
    );
  }

  // Write query result (no rows)
  if (result.changes !== undefined && (!result.columns || result.columns.length === 0)) {
    return (
      <div className="p-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-md px-3 py-2">
          <p className="text-[11px] font-medium text-green-500">
            Query executed successfully. {result.changes} row(s) affected.
          </p>
        </div>
      </div>
    )
  }

  const columns = result.columns ?? []
  const rows = result.rows ?? []

  if (columns.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-xs">
        No results
      </div>
    )
  }

  return <DataTable columns={columns} rows={rows} />
}

// ── Data Table with @tanstack/react-table ──

const COL_MIN_WIDTH = 100
const COL_DEFAULT_WIDTH = 160
const COL_MAX_WIDTH = 500
const ROW_NUM_WIDTH = 48

type RowData = Record<string, unknown>

interface SelectedCell {
  cellId: string
  columnName: string
  value: unknown
}

const DETAIL_DEFAULT_HEIGHT = 150
const DETAIL_MIN_HEIGHT = 80
const DETAIL_MAX_HEIGHT = 400
const DETAIL_COLLAPSE_THRESHOLD = 50

function DataTable({
  columns: columnNames,
  rows: rawRows,
}: {
  columns: string[]
  rows: unknown[][]
}): React.JSX.Element {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [copiedCellId, setCopiedCellId] = useState<string | null>(null)
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null)
  const [detailHeight, setDetailHeight] = useState(DETAIL_DEFAULT_HEIGHT)

  const handleCollapse = useCallback(() => {
    setSelectedCell(null)
  }, [])

  const handleExpand = useCallback((height: number) => {
    setDetailHeight(height)
  }, [])

  const { handleMouseDown: handleResizeMouseDown } = useResizeHandle({
    width: detailHeight,
    minWidth: DETAIL_MIN_HEIGHT,
    maxWidth: DETAIL_MAX_HEIGHT,
    resetWidth: DETAIL_DEFAULT_HEIGHT,
    direction: 'up',
    onWidthChange: setDetailHeight,
    collapseThreshold: DETAIL_COLLAPSE_THRESHOLD,
    onCollapse: handleCollapse,
    onExpand: handleExpand,
  })

  const handleCellClick = useCallback((cellId: string, columnName: string, value: unknown, e: MouseEvent) => {
    e.stopPropagation()
    const text = value === null || value === undefined ? 'NULL' : String(value)
    void navigator.clipboard.writeText(text)
    setCopiedCellId(cellId)
    setTimeout(() => setCopiedCellId(null), 800)
    setSelectedCell({ cellId, columnName, value })
  }, [])

  const data = useMemo<RowData[]>(
    () =>
      rawRows.map((row) => {
        const obj: RowData = {}
        columnNames.forEach((col, i) => {
          obj[col] = (row as unknown[])[i]
        })
        return obj
      }),
    [columnNames, rawRows],
  )

  const columns = useMemo<ColumnDef<RowData>[]>(
    () =>
      columnNames.map((col) => ({
        accessorKey: col,
        header: col,
        minSize: COL_MIN_WIDTH,
        size: COL_DEFAULT_WIDTH,
        maxSize: COL_MAX_WIDTH,
        cell: ({ getValue }) => {
          const val = getValue()
          if (val === null || val === undefined)
            return <span className="text-muted-foreground italic">NULL</span>
          return String(val)
        },
      })),
    [columnNames],
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: 'onChange',
  })

  const totalWidth = table.getTotalSize() + ROW_NUM_WIDTH

  const handleColumnResetDoubleClick = useCallback(
    (colId: string) => {
      table.getColumn(colId)?.resetSize()
    },
    [table],
  )

  const rows = table.getRowModel().rows

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 28,
    overscan: 20,
  })

  return (
    <div className="h-full flex flex-col">
      {/* Result count bar */}
      <div className="shrink-0 flex items-center justify-between px-3 h-8 bg-secondary/20 border-b border-border/40">
        <span className="text-[11px] text-muted-foreground">
          {rawRows.length} row{rawRows.length !== 1 ? "s" : ""} returned
        </span>
        <span className="text-[10px] text-muted-foreground">
          {columnNames.length} column{columnNames.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Scrollable table container */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <table
          className="text-xs border-collapse"
          style={{ minWidth: totalWidth, width: "100%" }}
        >
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-secondary/60">
                <th
                  className="text-left px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40 bg-secondary/60"
                  style={{ width: ROW_NUM_WIDTH, minWidth: ROW_NUM_WIDTH }}
                >
                  #
                </th>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="relative text-left px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40 bg-secondary/60 whitespace-nowrap select-none"
                    style={{
                      width: header.getSize(),
                      minWidth: header.column.columnDef.minSize,
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {/* Column resize handle */}
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      onDoubleClick={() =>
                        handleColumnResetDoubleClick(header.column.id)
                      }
                      className={`absolute right-0 top-0 h-full w-1.5 cursor-col-resize select-none touch-none hover:bg-primary/50 transition-colors ${
                        header.column.getIsResizing() ? "bg-primary/60" : ""
                      }`}
                    />
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rowVirtualizer.getVirtualItems().length > 0 && (
              <tr>
                <td
                  style={{
                    height: `${rowVirtualizer.getVirtualItems()[0].start}px`,
                    padding: 0,
                  }}
                  colSpan={columnNames.length + 1}
                />
              </tr>
            )}
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <tr
                  key={row.id}
                  ref={rowVirtualizer.measureElement}
                  data-index={virtualRow.index}
                  className={`border-b border-border/20 hover:bg-foreground/15 transition-colors ${
                    virtualRow.index % 2 === 1 ? "bg-foreground/[0.08]" : ""
                  }`}
                >
                  <td
                    className="px-2 py-1 text-muted-foreground tabular-nums"
                    style={{ width: ROW_NUM_WIDTH, minWidth: ROW_NUM_WIDTH }}
                  >
                    {virtualRow.index + 1}
                  </td>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      onClick={(e) =>
                        handleCellClick(
                          cell.id,
                          cell.column.id,
                          cell.getValue(),
                          e,
                        )
                      }
                      className={`px-2 py-1 text-foreground whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer transition-colors ${
                        copiedCellId === cell.id
                          ? "bg-primary/20"
                          : selectedCell?.cellId === cell.id
                            ? "bg-primary/10"
                            : ""
                      }`}
                      style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.columnDef.minSize,
                        maxWidth: cell.column.getSize(),
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
            {rowVirtualizer.getVirtualItems().length > 0 && (
              <tr>
                {(() => {
                  const items = rowVirtualizer.getVirtualItems();
                  const lastEnd = items[items.length - 1]?.end ?? 0;
                  return (
                    <td
                      style={{
                        height: `${rowVirtualizer.getTotalSize() - lastEnd}px`,
                        padding: 0,
                      }}
                      colSpan={columnNames.length + 1}
                    />
                  );
                })()}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cell detail panel */}
      {selectedCell && (
        <div
          className="shrink-0 border-t border-border/40 flex flex-col"
          style={{ height: detailHeight }}
        >
          {/* Resize handle */}
          <div
            onMouseDown={handleResizeMouseDown}
            className="shrink-0 h-1 cursor-row-resize hover:bg-primary/40 transition-colors bg-border/40"
          />
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between px-3 h-7 bg-secondary/30 border-b border-border/40">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
              {selectedCell.columnName}
            </span>
            <IconButton
              variant="ghost"
              size="xs"
              onClick={() => setSelectedCell(null)}
            >
              <X size={12} />
            </IconButton>
          </div>
          {/* Value */}
          <div className="flex-1 overflow-auto p-3">
            <pre className="text-xs text-foreground whitespace-pre-wrap break-all select-text">
              {selectedCell.value === null || selectedCell.value === undefined
                ? "NULL"
                : String(selectedCell.value)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
