import {
  lazy,
  Suspense,
  startTransition,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppInlineLoader } from "@/components/AppLoader";
import { ErrorMessage } from "@/components/ui/error-message";
import { useExplorerNavigation } from "../hooks/useExplorerNavigation";
import { useExplorerFsAutoRefresh } from "../hooks/useExplorerFsAutoRefresh";
import { useExplorerActivePath } from "../hooks/useExplorerActivePath";
import { useExplorerGoUp } from "../hooks/useExplorerGoUp";
import { useExplorerCurrentFolderPaste } from "../hooks/useExplorerCurrentFolderPaste";
import { ExplorerToolbar } from "./ExplorerToolbar";
import { ExplorerSearch } from "./ExplorerSearch";
import { FolderContents } from "./FolderContents";
import { ExplorerKeyboardOperations } from "./ExplorerKeyboardOperations";
import { MediaPreviewModal, isMediaFile } from "./MediaPreviewModal";
import { useSettingsStore } from "@/store/settings-store";
import { useExplorerPinsStore, explorerPinKey } from "@/store/explorer-pins-store";
import { GitPanel } from "./GitPanel";
import { getParentPath } from "../utils/getParentPath";

// Lazy-loaded to defer Monaco editor bundle until a file is opened
const FileContentViewer = lazy(() =>
  import("./FileContentViewer").then((m) => ({ default: m.FileContentViewer })),
);
const FileHistoryModal = lazy(() =>
  import("./FileHistoryPanel").then((m) => ({ default: m.FileHistoryModal })),
);
import type { RepoInfo, RepoItem } from "../ProjectExplorer.types";
import type { ViewMode, SortConfig } from "./ViewModes/ViewModes.types";

interface ExplorerPaneProps {
  repoInfo: RepoInfo;
  onSplit: () => void;
  onClose: () => void;
  onActivePathChange?: (rootPath: string, currentPath: string) => void;
  onRefreshReady?: (refresh: () => void) => void;
  onToggleAIPanel?: () => void;
}

export function ExplorerPane({
  repoInfo,
  onSplit,
  onClose,
  onActivePathChange,
  onRefreshReady,
  onToggleAIPanel,
}: ExplorerPaneProps): React.JSX.Element {
  const defaultView = useSettingsStore((s) => s.defaultExplorerView);
  const defaultSortField = useSettingsStore((s) => s.explorerSortField);
  const defaultSortDirection = useSettingsStore((s) => s.explorerSortDirection);
  const defaultShowHidden = useSettingsStore((s) => s.explorerShowHidden);
  const defaultHideFolders = useSettingsStore((s) => s.explorerHideFolders);
  const nav = useExplorerNavigation(defaultShowHidden);
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [sort, setSort] = useState<SortConfig>({
    field: defaultSortField,
    direction: defaultSortDirection,
  });

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    startTransition(() => setViewMode(mode));
  }, []);

  const handleSortChange = useCallback((s: SortConfig) => {
    startTransition(() => setSort(s));
  }, []);
  const [showHidden, setShowHidden] = useState(defaultShowHidden);
  const [hideFolders, setHideFolders] = useState(defaultHideFolders);
  const [gitPanelOpen, setGitPanelOpen] = useState(false);
  const didInit = useRef(false);
  const initRepo = nav.initRepo;

  // Sync local state with settings during render (React-recommended pattern)
  const [prevDefaults, setPrevDefaults] = useState({
    view: defaultView,
    sortField: defaultSortField,
    sortDir: defaultSortDirection,
    hidden: defaultShowHidden,
    hideFolders: defaultHideFolders,
  });
  if (
    defaultView !== prevDefaults.view ||
    defaultSortField !== prevDefaults.sortField ||
    defaultSortDirection !== prevDefaults.sortDir ||
    defaultShowHidden !== prevDefaults.hidden ||
    defaultHideFolders !== prevDefaults.hideFolders
  ) {
    setPrevDefaults({
      view: defaultView,
      sortField: defaultSortField,
      sortDir: defaultSortDirection,
      hidden: defaultShowHidden,
      hideFolders: defaultHideFolders,
    });
    if (defaultView !== prevDefaults.view) setViewMode(defaultView);
    if (
      defaultSortField !== prevDefaults.sortField ||
      defaultSortDirection !== prevDefaults.sortDir
    )
      setSort({ field: defaultSortField, direction: defaultSortDirection });
    if (defaultShowHidden !== prevDefaults.hidden)
      setShowHidden(defaultShowHidden);
    if (defaultHideFolders !== prevDefaults.hideFolders)
      setHideFolders(defaultHideFolders);
  }

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    initRepo(repoInfo);
  }, [initRepo, repoInfo]);

  const canGoUp = nav.currentPath !== '' && nav.currentPath !== '/'
  const handleGoUp = useCallback(() => {
    if (!canGoUp) return
    const parent = getParentPath(nav.currentPath)
    nav.navigateToFolder(parent)
  }, [canGoUp, nav.currentPath, nav.navigateToFolder])

  return (
    <div className="flex flex-col h-full flex-1 min-w-[300px] overflow-hidden border-r border-border/40 last:border-r-0">
      {!nav.repoInfo ? (
        <AppInlineLoader size={24} className="flex-1" />
      ) : (
        <PaneBody
          nav={nav}
          viewMode={viewMode}
          sort={sort}
          showHidden={showHidden}
          hideFolders={hideFolders}
          gitPanelOpen={gitPanelOpen}
          onToggleHidden={() => setShowHidden((v) => !v)}
          onToggleHideFolders={() => setHideFolders((v) => !v)}
          onToggleGitPanel={() => setGitPanelOpen((v) => !v)}
          onViewModeChange={handleViewModeChange}
          onSortChange={handleSortChange}
          onSplit={onSplit}
          onClose={onClose}
          onActivePathChange={onActivePathChange}
          onRefreshReady={onRefreshReady}
          onToggleAIPanel={onToggleAIPanel}
          onGoUp={handleGoUp}
          canGoUp={canGoUp}
        />
      )}
    </div>
  );
}

function PaneBody({
  nav,
  viewMode,
  sort,
  showHidden,
  hideFolders,
  gitPanelOpen,
  onToggleHidden,
  onToggleHideFolders,
  onToggleGitPanel,
  onViewModeChange,
  onSortChange,
  onSplit,
  onClose,
  onActivePathChange,
  onRefreshReady,
  onToggleAIPanel,
  onGoUp,
  canGoUp,
}: {
  nav: ReturnType<typeof useExplorerNavigation>;
  viewMode: ViewMode;
  sort: SortConfig;
  showHidden: boolean;
  hideFolders: boolean;
  gitPanelOpen: boolean;
  onToggleHidden: () => void;
  onToggleHideFolders: () => void;
  onToggleGitPanel: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onSortChange: (sort: SortConfig) => void;
  onSplit: () => void;
  onClose: () => void;
  onActivePathChange?: (rootPath: string, currentPath: string) => void;
  onRefreshReady?: (refresh: () => void) => void;
  onToggleAIPanel?: () => void;
  onGoUp: () => void;
  canGoUp: boolean;
}): React.JSX.Element {
  const [filteredItems, setFilteredItems] = useState<RepoItem[]>(nav.items);
  const [clearFiltersFn, setClearFiltersFn] = useState<(() => void) | null>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const pinnedRepos = useExplorerPinsStore((s) => s.pinnedRepos);
  const togglePin = useExplorerPinsStore((s) => s.togglePin);

  // Build a repo entry that represents the **currently displayed folder**, so
  // pinning while browsed into a sub-directory pins that sub-directory rather
  // than the pane's root repo.
  const navRepoSource = nav.repoInfo?.source;
  const navRepoRepository = nav.repoInfo?.repository;
  const navRepoOrganization = nav.repoInfo?.organization;
  const navRepoProject = nav.repoInfo?.project;
  const navRepoLocalPath = nav.repoInfo?.localPath;
  const navCurrentPath = nav.currentPath;

  const currentRepoEntry = useMemo<{
    source: string;
    repository: string;
    organization: string;
    project: string;
    localPath?: string;
  } | null>(() => {
    if (!navRepoSource || !navRepoRepository) return null;
    if (
      navRepoSource === "local" &&
      navRepoLocalPath &&
      navCurrentPath &&
      navCurrentPath !== "/"
    ) {
      const absolutePath = (navRepoLocalPath + navCurrentPath).replace(
        /\/+$/,
        "",
      );
      const lastSlash = absolutePath.lastIndexOf("/");
      const basename =
        lastSlash === -1 ? absolutePath : absolutePath.slice(lastSlash + 1);
      return {
        source: "local",
        repository: basename || navRepoRepository,
        organization: navRepoOrganization ?? "",
        project: navRepoProject ?? "",
        localPath: absolutePath,
      };
    }
    return {
      source: navRepoSource,
      repository: navRepoRepository,
      organization: navRepoOrganization ?? "",
      project: navRepoProject ?? "",
      localPath: navRepoLocalPath,
    };
  }, [
    navRepoSource,
    navRepoRepository,
    navRepoOrganization,
    navRepoProject,
    navRepoLocalPath,
    navCurrentPath,
  ]);

  const currentPinKey = currentRepoEntry
    ? explorerPinKey(currentRepoEntry)
    : null;
  const isPinned = currentPinKey
    ? pinnedRepos.some((r) => explorerPinKey(r) === currentPinKey)
    : false;

  const handleTogglePin = useCallback(() => {
    if (!currentRepoEntry) return;
    togglePin({
      repository: currentRepoEntry.repository,
      source: currentRepoEntry.source,
      organization: currentRepoEntry.organization,
      project: currentRepoEntry.project,
      localPath: currentRepoEntry.localPath,
      lastOpenedAt: new Date().toISOString(),
    });
  }, [currentRepoEntry, togglePin]);
  // Stable callback so ExplorerSearch's `useEffect([onClearFiltersReady])`
  // only runs once on mount — passing an inline arrow caused an infinite loop
  // ("Maximum update depth exceeded") because every parent render produced a
  // fresh prop reference, re-triggering the child effect and parent setState.
  const handleClearFiltersReady = useCallback((fn: () => void) => {
    setClearFiltersFn(() => fn);
  }, []);
  const [prevItems, setPrevItems] = useState(nav.items);
  const [mediaModal, setMediaModal] = useState<{
    path: string;
    objectId: string;
  } | null>(null);
  const [historyFilePath, setHistoryFilePath] = useState<string | null>(null);
  const [isGitRepo, setIsGitRepo] = useState(false);
  const [gitRootPath, setGitRootPath] = useState<string | null>(null);

  // Report current path to parent for the AI right panel
  useEffect(() => {
    if (nav.repoInfo?.source === "local" && nav.repoInfo.localPath) {
      onActivePathChange?.(nav.repoInfo.localPath, nav.currentPath);
    }
  }, [nav.repoInfo, nav.currentPath, onActivePathChange]);

  // Report refresh function to parent
  useEffect(() => {
    onRefreshReady?.(nav.refresh);
  }, [nav.refresh, onRefreshReady]);

  // Auto-refresh the file tree when the underlying filesystem changes
  // (e.g. file created/deleted by VSCode, terminal, or another tool).
  useExplorerFsAutoRefresh(
    nav.repoInfo?.source === "local" ? (nav.repoInfo.localPath ?? null) : null,
    nav.currentPath,
    nav.refresh,
  );

  // Check if the current directory is inside a git repository
  useEffect(() => {
    const repo = nav.repoInfo;
    if (!repo || repo.source !== "local" || !repo.localPath) {
      // Use a resolved promise to avoid synchronous setState in effect body
      Promise.resolve().then(() => {
        setIsGitRepo(false);
        setGitRootPath(null);
      });
      return;
    }
    // Combine browse root with current relative path to get the actual filesystem path
    const fullPath = repo.localPath + nav.currentPath;
    window.api.isLocalGitRepo({ rootPath: fullPath }).then((result) => {
      const typedResult = result as { success: boolean; data?: boolean };
      const isGit = typedResult.success && typedResult.data === true;
      setIsGitRepo(isGit);
      setGitRootPath(isGit ? fullPath.replace(/\/+$/, "") : null);
    });
  }, [nav.repoInfo, nav.currentPath]);

  // Sync showHidden to navigation hook so refreshes re-fetch with correct flag
  useEffect(() => {
    nav.setShowHidden(showHidden);
  }, [showHidden, nav.setShowHidden]);

  // Re-fetch items when showHidden changes
  const prevShowHidden = useRef(showHidden);
  useEffect(() => {
    if (prevShowHidden.current !== showHidden) {
      prevShowHidden.current = showHidden;
      nav.refresh();
    }
  }, [showHidden, nav.refresh]);

  if (nav.items !== prevItems) {
    setPrevItems(nav.items);
    setFilteredItems(nav.items);
  }

  // Apply hideFolders filter
  const displayItems = useMemo(
    () =>
      hideFolders
        ? filteredItems.filter((item) => !item.isFolder)
        : filteredItems,
    [filteredItems, hideFolders],
  );

  // Keyboard navigation: lifted active item + Backspace go-up handler.
  // Note: rename the setter so it doesn't shadow the `onActivePathChange` prop
  // (which has a different signature for reporting (rootPath, currentPath) up).
  const { activePath, onActivePathChange: setActivePath } = useExplorerActivePath({
    currentPath: nav.currentPath,
    isViewingFile: nav.isViewingFile,
    items: displayItems,
  });
  const goUp = useExplorerGoUp({
    currentPath: nav.currentPath,
    navigateToFolder: nav.navigateToFolder,
  });

  // Active item resolved from the lifted activePath — target for keyboard
  // file-operation shortcuts (rename, delete, copy, etc.).
  const activeItem = useMemo(
    () => displayItems.find((item) => item.path === activePath) ?? null,
    [displayItems, activePath],
  );

  const handleOpenFile = useCallback(
    (path: string, objectId: string) => {
      if (isMediaFile(path)) {
        setMediaModal({ path, objectId });
      } else {
        nav.openFile(path, objectId);
      }
    },
    [nav.openFile],
  );

  const handleFileHistory = useCallback((filePath: string) => {
    setHistoryFilePath(filePath);
  }, []);

  // Keyboard shortcut: Cmd+K to toggle AI Panel (local repos only)
  useEffect(() => {
    if (nav.repoInfo?.source !== "local" || !nav.repoInfo?.localPath) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onToggleAIPanel?.();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [nav.repoInfo, onToggleAIPanel]);

  const showKeyboardOps =
    !!activeItem && nav.repoInfo?.source === "local";

  // Allow Cmd+V to paste into the current folder even when no row is selected
  // (the item-scoped handler above only mounts when a row is active).
  useExplorerCurrentFolderPaste({
    paneRef,
    enabled: nav.repoInfo?.source === "local",
    rootPath: nav.repoInfo?.localPath,
    currentPath: nav.currentPath,
    hasSelection: !!activeItem,
    onPasted: nav.refresh,
  });

  return (
    <div ref={paneRef} className="flex h-full overflow-hidden">
      {showKeyboardOps && (
        <ExplorerKeyboardOperations
          containerRef={paneRef}
          item={activeItem}
          rootPath={nav.repoInfo?.localPath ?? undefined}
          source="local"
          onChanged={nav.refresh}
          onFileHistory={isGitRepo ? handleFileHistory : undefined}
        />
      )}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <ExplorerToolbar
          currentPath={nav.currentPath}
          canGoBack={nav.canGoBack}
          canGoForward={nav.canGoForward}
          isLoading={nav.isLoading}
          onGoBack={nav.goBack}
          onGoForward={nav.goForward}
          onGoUp={onGoUp}
          canGoUp={canGoUp}
          onNavigate={nav.navigateToFolder}
          onRefresh={nav.refresh}
          repoName={nav.repoInfo!.repository}
          source={nav.repoInfo!.source}
          activeMode={viewMode}
          onModeChange={onViewModeChange}
          sort={sort}
          onSortChange={onSortChange}
          showHidden={showHidden}
          onToggleHidden={onToggleHidden}
          hideFolders={hideFolders}
          onToggleHideFolders={onToggleHideFolders}
          onSplit={onSplit}
          onClose={onClose}
          isPinned={isPinned}
          onTogglePin={handleTogglePin}
          rootPath={
            nav.repoInfo!.source === "local" ? nav.repoInfo!.localPath : undefined
          }
          onPasted={nav.refresh}
          onOpenAICommand={
            nav.repoInfo!.source === "local" && nav.repoInfo!.localPath
              ? onToggleAIPanel
              : undefined
          }
        />

        {!nav.isViewingFile && nav.items.length > 0 && (
          <ExplorerSearch
            items={nav.items}
            onFilteredItemsChange={setFilteredItems}
            isGitRepo={isGitRepo}
            gitPanelOpen={gitPanelOpen}
            onToggleGitPanel={onToggleGitPanel}
            onClearFiltersReady={handleClearFiltersReady}
          />
        )}

        {nav.error && <ErrorMessage message={nav.error} />}

        {nav.isLoading ? (
          <AppInlineLoader size={24} className="flex-1" />
        ) : nav.isViewingFile && nav.fileContent !== null ? (
          <Suspense fallback={<AppInlineLoader size={24} className="flex-1" />}>
            <ErrorBoundary componentName="File Viewer">
              <FileContentViewer
                path={nav.currentPath}
                content={nav.fileContent}
              />
            </ErrorBoundary>
          </Suspense>
        ) : (
          <>
            <FolderContents
              items={displayItems}
              currentPath={nav.currentPath}
              viewMode={viewMode}
              sort={sort}
              source={nav.repoInfo?.source}
              rootPath={nav.repoInfo?.localPath ?? undefined}
              onOpenFolder={nav.navigateToFolder}
              onOpenFile={handleOpenFile}
              onFileHistory={isGitRepo ? handleFileHistory : undefined}
              onChanged={nav.refresh}
              onSortChange={onSortChange}
              activePath={activePath}
              onActivePathChange={setActivePath}
              onGoUp={goUp}
              originalItemsCount={nav.items.length}
              onClearFilters={clearFiltersFn ?? undefined}
            />
          </>
        )}

        {nav.repoInfo && mediaModal && (
          <MediaPreviewModal
            open={!!mediaModal}
            onOpenChange={(open) => !open && setMediaModal(null)}
            filePath={mediaModal.path}
            objectId={mediaModal.objectId}
            repoInfo={nav.repoInfo}
          />
        )}

        {nav.repoInfo?.localPath && historyFilePath && (
          <Suspense fallback={null}>
            <ErrorBoundary componentName="File History">
              <FileHistoryModal
                open={!!historyFilePath}
                onOpenChange={(open) => !open && setHistoryFilePath(null)}
                filePath={historyFilePath}
                rootPath={nav.repoInfo.localPath}
              />
            </ErrorBoundary>
          </Suspense>
        )}
      </div>

      {isGitRepo && gitRootPath && (
        <GitPanel
          rootPath={gitRootPath}
          isOpen={gitPanelOpen}
          onClose={onToggleGitPanel}
        />
      )}
    </div>
  );
}
