import { useCallback, useEffect, useRef } from "react";
import { Bug, MousePointerClick, Search, Trash2 } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { ResizablePanel } from "@/components/ResizablePanel";
import { SidebarLayout } from "@/components/ui/sidebar-layout";
import { SIDE_PANEL_SURFACE_CLASS } from "@/lib/panel-classes";
import { SectionHeader } from "@/components/ui/section-header";
import { Switch } from "@/components/ui/switch";
import { IconButton } from "@/components/ui/icon-button";
import { useSettingsStore } from "@/store/settings-store";
import type { RequestStatus } from "@/store/debug-store";

import { STATUS_FILTERS } from "../../DebugPanel.constants";
import { RequestRow } from "../../components/RequestRow";
import { RequestDetail } from "../../components/RequestDetail";
import { DebugStats } from "../../components/DebugStats";
import { useDebugPanel } from "../../hooks";

export function ApiInspectorTab(): React.JSX.Element {
  const {
    filteredRequests,
    selectedRequest,
    statusFilter,
    searchQuery,
    selectedId,
    isIntercepting,
    stats,
    setStatusFilter,
    setSearchQuery,
    selectRequest,
    navigateRequest,
    handleClear,
    toggleIntercepting,
  } = useDebugPanel();

  const sidebarPosition = useSettingsStore((s) => s.sidebarPosition);
  const hasRequests = filteredRequests.length > 0;
  const interceptLabel = isIntercepting ? "Intercepting" : "Not active";

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: filteredRequests.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 5,
  });

  useEffect(() => {
    if (!selectedId) return;
    const index = filteredRequests.findIndex((r) => r.id === selectedId);
    if (index !== -1) {
      rowVirtualizer.scrollToIndex(index, { align: "auto" });
    }
  }, [selectedId, filteredRequests, rowVirtualizer]);

  const handleListKeyDown = useCallback(
    (e: React.KeyboardEvent): void => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        navigateRequest("down");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        navigateRequest("up");
      }
    },
    [navigateRequest],
  );

  const requestListContent = hasRequests ? (
    <div
      ref={parentRef}
      className="flex-1 overflow-y-auto outline-none"
      tabIndex={0}
      onKeyDown={handleListKeyDown}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const request = filteredRequests[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
              ref={rowVirtualizer.measureElement}
              data-index={virtualRow.index}
            >
              <RequestRow
                request={request}
                isSelected={selectedId === request.id}
                onSelect={selectRequest}
              />
            </div>
          );
        })}
      </div>
    </div>
  ) : (
    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground select-none px-4">
      <Bug size={18} className="text-muted-foreground/40" />
      <span className="text-xs text-center text-muted-foreground/60">
        {isIntercepting
          ? "Waiting for API requests..."
          : "Enable intercepting to capture requests"}
      </span>
    </div>
  );

  const sidebar = (
    <ResizablePanel
      as="aside"
      defaultWidth={360}
      minWidth={280}
      maxWidth={600}
      position={sidebarPosition}
      className={SIDE_PANEL_SURFACE_CLASS}
      expandTitle="Expand request list"
      collapseTitle="Collapse request list"
    >
      <div className="h-full flex flex-col">
        <div className="shrink-0 border-b border-border/40 px-3 py-2.5 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <SectionHeader icon={Bug} title="Debug" />
              <div className="flex items-center gap-1.5 text-[10px]">
                <Switch
                  checked={isIntercepting}
                  onCheckedChange={toggleIntercepting}
                />
                <span className="text-muted-foreground">{interceptLabel}</span>
              </div>
            </div>
            <IconButton
              tooltip="Clear all requests"
              onClick={handleClear}
              size="sm"
            >
              <Trash2 size={14} />
            </IconButton>
          </div>

          <DebugStats stats={stats} />

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={12}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Filter channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-2 py-1 text-[11px] bg-secondary/40 border border-transparent rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-input focus:ring-1 focus:ring-ring/20"
              />
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-0.5">
            {STATUS_FILTERS.map(({ value, label }) => {
              const isActive = statusFilter === value;
              const btnClass = isActive
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground";

              return (
                <button
                  key={value}
                  onClick={() =>
                    setStatusFilter(value as RequestStatus | "all")
                  }
                  className={`px-2 py-0.5 text-[10px] rounded-md transition-colors cursor-pointer ${btnClass}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {requestListContent}
      </div>
    </ResizablePanel>
  );

  const detailContent = selectedRequest ? (
    <div className="flex-1 h-full">
      <RequestDetail request={selectedRequest} />
    </div>
  ) : (
    <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground select-none">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/50 border border-border/40">
        <MousePointerClick size={22} className="text-muted-foreground/60" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-medium">No request selected</span>
        <span className="text-xs text-muted-foreground/60">
          Click a request from the sidebar to inspect its details
        </span>
      </div>
    </div>
  );

  return (
    <SidebarLayout sidebarPosition={sidebarPosition} sidebar={sidebar}>
      {detailContent}
    </SidebarLayout>
  );
}
