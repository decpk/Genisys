import { invoke } from '@tauri-apps/api/core'
import { emit, listen } from '@tauri-apps/api/event'
import { open } from '@tauri-apps/plugin-dialog'
import type { CachedImageRecord } from './components/Library/types/cached-image-record'

// ── Debug Event Interception ─────────────────────────────────────────

type DebugCallback = (data: unknown) => void
const debugListeners: Set<DebugCallback> = new Set()

function emitDebugEvent(data: unknown): void {
  if (!import.meta.env.DEV) return
  // Fire-and-forget: defer to idle callback so it never blocks API calls
  const notify = () => {
    for (const cb of debugListeners) cb(data)
    void emit('debug-event', data)
  }
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(notify)
  } else {
    setTimeout(notify, 0)
  }
}

let idCounter = 0
function trackedInvoke<T>(channel: string, args?: Record<string, unknown>): Promise<T> {
  if (!import.meta.env.DEV) return invoke<T>(channel, args)

  const id = `req-${++idCounter}-${Date.now()}`
  const t = Date.now()
  emitDebugEvent({ type: 'start', id, ch: channel, args: args ? [args] : [], t })

  return invoke<T>(channel, args).then(
    (res) => {
      emitDebugEvent({ type: 'end', id, ok: true, res, t: Date.now() })
      return res
    },
    (err) => {
      emitDebugEvent({ type: 'end', id, ok: false, err: String(err), t: Date.now() })
      throw err
    }
  )
}

// ── In-memory caches ─────────────────────────────────────────────────
let cachedModelsPromise: Promise<any> | null = null

// ── Screen-capture protection ────────────────────────────────────────
// Read the current "prevent screen capture" security setting so newly
// created windows are born protected (avoids a capturable flash before the
// window's own React boot re-applies protection). Dynamically imported to
// avoid a static import cycle with the settings store.
async function getPreventScreenCapture(): Promise<boolean> {
  try {
    const { useSettingsStore } = await import('@/store/settings-store')
    return useSettingsStore.getState().securityPreventScreenCapture
  } catch {
    return false
  }
}

// ── User Directories (Explorer sidebar shortcuts) ─────────────────────
// Mirrors the `UserDirectories` Rust struct returned by
// `cmd_get_user_directories`. Each field is optional because the directory
// may not exist on the current platform / user profile.
export interface UserDirectories {
  home: string | null
  desktop: string | null
  downloads: string | null
  documents: string | null
  applications: string | null
  pictures: string | null
}

// ── Messages (P2P E2E-encrypted local messaging) payload shapes ───────
// Mirror the Rust structs (serde camelCase). The front-end re-declares
// these in src/components/Messages/Messages.types.ts; the two are kept
// structurally identical. Conversation content is never persisted.
export interface MsgIdentity {
  publicKey: string;
  fingerprint: string;
  displayName: string;
  listenPort: number;
  localIp: string | null;
}

export type MsgPeerStatus =
  | 'discovered'
  | 'connecting'
  | 'pending'
  | 'connected'
  | 'disconnected'

export interface MsgPeer {
  id: string
  publicKey: string
  displayName: string
  host: string
  port: number
  status: MsgPeerStatus
  verified: boolean
  keyChanged: boolean
  safetyNumber: string | null
}

export interface MsgEnvelope {
  id: string
  peerId: string
  direction: 'incoming' | 'outgoing'
  kind: 'text' | 'image'
  text: string | null
  imageBase64: string | null
  mimeType: string | null
  fileName: string | null
  timestamp: number
}

export interface MsgRequest {
  peerId: string
  displayName: string
  fingerprint: string
  host: string
  port: number
  safetyNumber: string | null
}

// Content Share — share whole books + notes between Genisys devices on the LAN.
export interface ContentSharePeer {
  deviceId: string
  deviceName: string
  host: string
  port: number
}

export interface ContentShareStatus {
  running: boolean
  deviceId: string
  deviceName: string
  ip: string | null
  port: number | null
  peers: ContentSharePeer[]
}

export interface ContentShareManifest {
  kind: 'library' | 'notes'
  title: string
  summary: string
  sizeBytes: number
}

export interface ContentShareIncoming {
  transferId: string
  senderDeviceId: string
  senderDeviceName: string
  manifest: ContentShareManifest
}

export interface ContentShareReceived {
  kind: 'library' | 'notes'
  title: string
  senderDeviceName: string
}

export interface ContentShareSendProgress {
  deviceId: string
  phase: 'waiting' | 'uploading'
  sent: number
  total: number
}

// Explorer — copy/paste progress (Finder/Explorer-style determinate bar).
export interface ExplorerCopyProgress {
  operationId: string
  totalBytes: number
  copiedBytes: number
  totalFiles: number
  filesDone: number
  currentFile: string
  done: boolean
}

// Tauri API Bridge — maps window.api.xxx() to Tauri invoke() calls
// Matches every method from the original Electron preload

export interface BrowserApp {
  id: string
  name: string
  appName: string
}

const api = {
  // Keep Awake ("Stay Awake")
  keepAwakeStart: () => trackedInvoke<void>("cmd_keep_awake_start"),
  keepAwakeStop: () => trackedInvoke<void>("cmd_keep_awake_stop"),
  keepAwakeStatus: () => trackedInvoke<boolean>("cmd_keep_awake_status"),
  keepAwakeLidSet: (enabled: boolean) =>
    trackedInvoke<void>("cmd_keep_awake_lid_set", { enabled }),
  keepAwakeLidStatus: () => trackedInvoke<boolean>("cmd_keep_awake_lid_status"),
  // Native macOS Accessibility (input-simulation) permission flow
  accessibilityStatus: () =>
    trackedInvoke<boolean>("cmd_accessibility_status"),
  requestAccessibility: () =>
    trackedInvoke<boolean>("cmd_request_accessibility"),
  openAccessibilitySettings: () =>
    trackedInvoke<void>("cmd_open_accessibility_settings"),

  // Projects
  loadProjects: () => trackedInvoke("load_projects"),
  createProject: (name: string) => trackedInvoke("create_project", { name }),
  deleteProject: (projectId: string) =>
    trackedInvoke("delete_project", { projectId }),
  renameProject: (projectId: string, name: string) =>
    trackedInvoke("rename_project", { projectId, name }),
  setActiveProject: (projectId: string) =>
    trackedInvoke("set_active_project", { projectId }),

  // Settings
  loadSettings: (projectId: string) =>
    trackedInvoke("cmd_load_settings", { projectId }),
  saveSettings: (projectId: string, settings: any) =>
    trackedInvoke("cmd_save_settings", { projectId, settings }),
  loadAppData: () => trackedInvoke("cmd_load_app_data"),
  saveAppData: (data: any) => trackedInvoke("cmd_save_app_data", { data }),

  // Live Sports Tiles
  loadLiveSportsTiles: () => trackedInvoke<any[]>("cmd_load_live_sports_tiles"),
  saveLiveSportsTiles: (tiles: any[]) =>
    trackedInvoke("cmd_save_live_sports_tiles", { tiles }),

  // News Tile
  loadNewsTile: () => trackedInvoke<any>("cmd_load_news_tile"),
  saveNewsTile: (tile: any) => trackedInvoke("cmd_save_news_tile", { tile }),
  loadNewsInterests: (tileId: string) =>
    trackedInvoke<any[]>("cmd_load_news_interests", { tileId }),
  saveNewsInterests: (tileId: string, interests: any[]) =>
    trackedInvoke("cmd_save_news_interests", { tileId, interests }),
  loadNewsArticles: (interestId: string) =>
    trackedInvoke<any[]>("cmd_load_news_articles", { interestId }),
  loadLikedNewsArticles: (tileId: string) =>
    trackedInvoke<any[]>("cmd_load_liked_news_articles", { tileId }),
  saveNewsArticles: (interestId: string, articles: any[]) =>
    trackedInvoke("cmd_save_news_articles", { interestId, articles }),
  toggleNewsArticleLiked: (articleId: string, liked: boolean) =>
    trackedInvoke("cmd_toggle_news_article_liked", { articleId, liked }),
  deleteNewsArticlesForInterest: (interestId: string) =>
    trackedInvoke("cmd_delete_news_articles_for_interest", { interestId }),

  // Stocks Tile
  loadStocksTile: () => trackedInvoke<any>("cmd_load_stocks_tile"),
  saveStocksTile: (tile: any) =>
    trackedInvoke("cmd_save_stocks_tile", { tile }),
  loadStocksWatchlist: (tileId: string) =>
    trackedInvoke<any[]>("cmd_load_stocks_watchlist", { tileId }),
  saveStocksWatchlist: (tileId: string, items: any[]) =>
    trackedInvoke("cmd_save_stocks_watchlist", { tileId, items }),
  deleteStocksWatchItem: (itemId: string) =>
    trackedInvoke("cmd_delete_stocks_watch_item", { itemId }),
  loadStocksNews: (watchlistId: string) =>
    trackedInvoke<any[]>("cmd_load_stocks_news", { watchlistId }),
  saveStocksNews: (watchlistId: string, items: any[]) =>
    trackedInvoke("cmd_save_stocks_news", { watchlistId, items }),
  searchStockSymbols: (query: string) =>
    trackedInvoke<{ success: boolean; results?: any[]; error?: string }>(
      "cmd_stocks_search",
      { query },
    ),
  fetchStockQuote: (symbol: string, force?: boolean) =>
    trackedInvoke<{
      success: boolean;
      quote?: any;
      cached?: boolean;
      stale?: boolean;
      error?: string;
    }>("cmd_stocks_fetch_quote", { symbol, force: force ?? false }),
  fetchStockHistory: (symbol: string, range: string, force?: boolean) =>
    trackedInvoke<{
      success: boolean;
      symbol?: string;
      range?: string;
      points?: any[];
      cached?: boolean;
      stale?: boolean;
      error?: string;
    }>("cmd_stocks_fetch_history", { symbol, range, force: force ?? false }),
  fetchStockNews: (symbol: string, count?: number) =>
    trackedInvoke<{ success: boolean; items?: any[]; error?: string }>(
      "cmd_stocks_fetch_news",
      { symbol, count: count ?? 15 },
    ),
  fetchCustomPriceJson: (url: string) =>
    trackedInvoke<{ success: boolean; data?: any; error?: string }>(
      "cmd_stocks_fetch_custom_price",
      { url },
    ),

  // LLM JSON Completion (non-streaming, single-shot)
  llmJsonCompletion: (params: {
    systemPrompt: string;
    userPrompt: string;
    model?: string;
  }) =>
    trackedInvoke<{ success: boolean; content?: string; error?: string }>(
      "cmd_llm_json_completion",
      {
        systemPrompt: params.systemPrompt,
        userPrompt: params.userPrompt,
        model: params.model ?? null,
      },
    ),

  // ── LLM Stream Completion (SSE-streamed single-shot) ───────
  sendLlmStreamCompletion: (params: {
    streamId: string;
    systemPrompt: string;
    userPrompt: string;
    model?: string;
  }) =>
    trackedInvoke("cmd_llm_stream_completion", {
      streamId: params.streamId,
      systemPrompt: params.systemPrompt,
      userPrompt: params.userPrompt,
      model: params.model ?? null,
    }),
  onLlmStreamChunk: (callback: (data: any) => void) => {
    const unlisten = listen("llm-stream-chunk", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onLlmStreamDone: (callback: (data: any) => void) => {
    const unlisten = listen("llm-stream-done", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onLlmStreamError: (callback: (data: any) => void) => {
    const unlisten = listen("llm-stream-error", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onLlmStreamReasoningChunk: (callback: (data: any) => void) => {
    const unlisten = listen("llm-stream-reasoning-chunk", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },

  // Repo Explorer
  selectLocalRepo: async () => {
    const selected = await open({ directory: true, multiple: false });
    if (selected) return { success: true, data: selected };
    return { success: false, error: "No directory selected" };
  },
  getLocalRepoItems: (params: any) =>
    trackedInvoke("cmd_get_local_repo_items", params),
  getLocalFileContent: (params: any) =>
    trackedInvoke("cmd_get_local_file_content", params),
  getLocalMediaDataUrl: (params: any) =>
    trackedInvoke("cmd_get_local_media_data_url", params),
  isDirectory: (path: string) =>
    trackedInvoke<{ isDirectory: boolean }>("cmd_is_directory", { path }),

  // User Directories (Explorer sidebar shortcuts — Home/Desktop/Downloads/…)
  getUserDirectories: () =>
    trackedInvoke<UserDirectories>("cmd_get_user_directories"),

  // Explorer File Operations
  createFile: (rootPath: string, filePath: string, content: string) =>
    trackedInvoke("cmd_create_file", { rootPath, filePath, content }),
  createFolder: (rootPath: string, folderPath: string) =>
    trackedInvoke("cmd_create_folder", { rootPath, folderPath }),
  deleteItem: (rootPath: string, path: string) =>
    trackedInvoke("cmd_delete_item", { rootPath, path }),
  softDeleteItem: (rootPath: string, path: string) =>
    trackedInvoke("cmd_soft_delete_item", { rootPath, path }),
  renameItem: (rootPath: string, oldPath: string, newPath: string) =>
    trackedInvoke("cmd_rename_item", { rootPath, oldPath, newPath }),
  moveItem: (
    rootPath: string,
    source: string,
    destination: string,
    sourceRoot?: string,
  ) =>
    trackedInvoke("cmd_move_item", {
      rootPath,
      source,
      destination,
      sourceRoot,
    }),
  copyItem: (
    rootPath: string,
    source: string,
    destination: string,
    sourceRoot?: string,
    operationId?: string,
  ) =>
    trackedInvoke("cmd_copy_item", {
      rootPath,
      source,
      destination,
      sourceRoot,
      operationId,
    }),
  getDiskUsage: (rootPath: string, path: string) =>
    trackedInvoke("cmd_get_disk_usage", { rootPath, path }),

  // Open in external apps
  openInTerminal: (path: string) =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_open_in_terminal",
      { path },
    ),
  openInVSCode: (path: string) =>
    trackedInvoke<{ success: boolean; error?: string }>("cmd_open_in_vscode", {
      path,
    }),

  // Browsers + opening multiple URLs
  listBrowsers: () =>
    trackedInvoke<{ success: boolean; browsers: BrowserApp[] }>("cmd_list_browsers"),
  openUrlsInBrowser: (urls: string[], browser?: string) =>
    trackedInvoke<{ success: boolean; opened: number; error?: string }>(
      "cmd_open_urls_in_browser",
      { urls, browser },
    ),

  // Explorer AI Command
  sendExplorerAICommand: (params: {
    streamId: string;
    rootPath: string;
    instruction: string;
    conversationHistory?: any[];
    model?: string;
    maxTools?: number;
  }) =>
    trackedInvoke("cmd_explorer_ai_command", {
      streamId: params.streamId,
      rootPath: params.rootPath,
      instruction: params.instruction,
      conversationHistory: params.conversationHistory ?? null,
      model: params.model ?? null,
      maxTools: params.maxTools ?? null,
    }),
  onExplorerAIChunk: (callback: (data: any) => void) => {
    const unlisten = listen("explorer-ai-chunk", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onExplorerAIDone: (callback: (data: any) => void) => {
    const unlisten = listen("explorer-ai-done", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onExplorerAIError: (callback: (data: any) => void) => {
    const unlisten = listen("explorer-ai-error", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onExplorerAIReasoningChunk: (callback: (data: any) => void) => {
    const unlisten = listen("explorer-ai-reasoning-chunk", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onExplorerAIToolStart: (callback: (data: any) => void) => {
    const unlisten = listen("explorer-ai-tool-start", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onExplorerAIToolResult: (callback: (data: any) => void) => {
    const unlisten = listen("explorer-ai-tool-result", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onExplorerAIShellConfirmRequest: (callback: (data: any) => void) => {
    const unlisten = listen("explorer-ai-shell-confirm-request", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  respondExplorerAIShellConfirm: (params: {
    confirmId: string;
    approved: boolean;
  }) =>
    trackedInvoke("cmd_explorer_ai_shell_respond", {
      confirmId: params.confirmId,
      approved: params.approved,
    }),

  // Explorer History
  loadExplorerHistory: (beforeCursor?: string) =>
    trackedInvoke("cmd_load_explorer_history", {
      beforeCursor: beforeCursor ?? null,
    }),
  saveExplorerRepo: (entry: any) =>
    trackedInvoke("cmd_save_explorer_repo", { entry }),
  removeExplorerRepo: (entry: any) =>
    trackedInvoke("cmd_remove_explorer_repo", { entry }),
  clearExplorerHistory: () => trackedInvoke("cmd_clear_explorer_history"),

  // Git
  isLocalGitRepo: (params: any) =>
    trackedInvoke("cmd_is_local_git_repo", params),
  getGitStatus: (params: any) => trackedInvoke("cmd_get_git_status", params),
  getGitLog: (params: any) => trackedInvoke("cmd_get_git_log", params),
  getGitCommitCount: (params: any) =>
    trackedInvoke("cmd_get_git_commit_count", params),
  getGitCommitCalendar: (params: any) =>
    trackedInvoke("cmd_get_git_commit_calendar", params),
  getGitWorktrees: (params: any) =>
    trackedInvoke("cmd_get_git_worktrees", params),
  getGitBranch: (params: any) => trackedInvoke("cmd_get_git_branch", params),
  getLocalFileGitHistory: (params: any) =>
    trackedInvoke("cmd_get_local_file_git_history", params),
  getLocalFileAtCommit: (params: any) =>
    trackedInvoke("cmd_get_local_file_at_commit", params),
  getGitBlame: (params: {
    rootPath: string;
    filePath: string;
    startLine: number;
    endLine: number;
  }) => trackedInvoke("cmd_git_blame", params),
  getGitRemoteUrl: (params: { rootPath: string }) =>
    trackedInvoke("cmd_get_git_remote_url", params),
  gitSnapshot: (params: any) => trackedInvoke("cmd_git_snapshot", params),
  gitOperationState: (params: { rootPath: string }) =>
    trackedInvoke("cmd_git_operation_state", params),
  gitStartWatching: (params: any) =>
    trackedInvoke("cmd_git_start_watching", params),
  gitStopWatching: (params: any) =>
    trackedInvoke("cmd_git_stop_watching", params),
  // Generic FS watcher (used by the Code app).
  fsStartWatching: (params: { rootPath: string }) =>
    trackedInvoke("cmd_fs_start_watching", params),
  fsStopWatching: (params: { rootPath: string }) =>
    trackedInvoke("cmd_fs_stop_watching", params),
  gitStageFiles: (params: any) => trackedInvoke("cmd_git_stage_files", params),
  gitUnstageFiles: (params: any) =>
    trackedInvoke("cmd_git_unstage_files", params),
  gitDiscardChanges: (params: any) =>
    trackedInvoke("cmd_git_discard_changes", params),
  gitCommit: (params: any) => trackedInvoke("cmd_git_commit", params),
  gitPush: (params: any) => trackedInvoke("cmd_git_push", params),
  gitPull: (params: any) => trackedInvoke("cmd_git_pull", params),
  gitFetch: (params: any) => trackedInvoke("cmd_git_fetch", params),
  gitGetBranches: (params: any) =>
    trackedInvoke("cmd_git_get_branches", params),
  gitCheckoutBranch: (params: any) =>
    trackedInvoke("cmd_git_checkout_branch", params),
  gitGetDiff: (params: any) => trackedInvoke("cmd_git_get_diff", params),
  gitGetCommitContext: (params: any) =>
    trackedInvoke("cmd_git_get_commit_context", params),

  // Phase 2 git tools — stash family
  gitStashList: (params: { rootPath: string }) =>
    trackedInvoke("cmd_git_stash_list", params),
  gitStashSave: (params: {
    rootPath: string;
    message?: string;
    includeUntracked?: boolean;
    keepIndex?: boolean;
  }) => trackedInvoke("cmd_git_stash_save", params),
  gitStashPop: (params: { rootPath: string; stashRef?: string }) =>
    trackedInvoke("cmd_git_stash_pop", params),
  gitStashApply: (params: { rootPath: string; stashRef?: string }) =>
    trackedInvoke("cmd_git_stash_apply", params),
  gitStashDrop: (params: { rootPath: string; stashRef?: string }) =>
    trackedInvoke("cmd_git_stash_drop", params),
  gitStashShow: (params: {
    rootPath: string;
    stashRef?: string;
    format?: "patch" | "stat";
  }) => trackedInvoke("cmd_git_stash_show", params),

  // Phase 2 git tools — branch ops
  gitBranchCreate: (params: {
    rootPath: string;
    name: string;
    startPoint?: string;
    checkout?: boolean;
  }) => trackedInvoke("cmd_git_branch_create", params),
  gitBranchDelete: (params: {
    rootPath: string;
    name: string;
    force?: boolean;
  }) => trackedInvoke("cmd_git_branch_delete", params),
  gitBranchRename: (params: {
    rootPath: string;
    from?: string;
    to: string;
    force?: boolean;
  }) => trackedInvoke("cmd_git_branch_rename", params),

  // Phase 2 git tools — commit mutations
  gitCommitAmend: (params: {
    rootPath: string;
    message?: string;
    noEdit?: boolean;
  }) => trackedInvoke("cmd_git_commit_amend", params),
  gitReset: (params: {
    rootPath: string;
    target: string;
    mode: "soft" | "mixed" | "hard";
  }) => trackedInvoke("cmd_git_reset", params),
  gitRevert: (params: {
    rootPath: string;
    commit: string;
    noCommit?: boolean;
  }) => trackedInvoke("cmd_git_revert", params),

  // Phase 2 git tools — workdir-clobbering
  gitClean: (params: {
    rootPath: string;
    paths?: string[];
    includeIgnored?: boolean;
    includeDirectories?: boolean;
    dryRun?: boolean;
  }) => trackedInvoke("cmd_git_clean", params),
  gitRestore: (params: {
    rootPath: string;
    paths: string[];
    source?: string;
    staged?: boolean;
    worktree?: boolean;
  }) => trackedInvoke("cmd_git_restore", params),

  // Phase 3 git tools — multi-step flows (merge/rebase/cherry-pick/bisect/reflog)
  gitMerge: (params: {
    rootPath: string;
    refName: string;
    noFf?: boolean;
    squash?: boolean;
    message?: string;
  }) => trackedInvoke("cmd_git_merge", params),
  gitMergeAbort: (params: { rootPath: string }) =>
    trackedInvoke("cmd_git_merge_abort", params),
  gitMergeContinue: (params: { rootPath: string }) =>
    trackedInvoke("cmd_git_merge_continue", params),
  gitRebase: (params: {
    rootPath: string;
    upstream?: string;
    branch?: string;
    onto?: string;
    interactive?: boolean;
  }) => trackedInvoke("cmd_git_rebase", params),
  gitRebaseContinue: (params: { rootPath: string }) =>
    trackedInvoke("cmd_git_rebase_continue", params),
  gitRebaseAbort: (params: { rootPath: string }) =>
    trackedInvoke("cmd_git_rebase_abort", params),
  gitRebaseSkip: (params: { rootPath: string }) =>
    trackedInvoke("cmd_git_rebase_skip", params),
  gitCherryPick: (params: {
    rootPath: string;
    commits: string[];
    noCommit?: boolean;
  }) => trackedInvoke("cmd_git_cherry_pick", params),
  gitCherryPickContinue: (params: { rootPath: string }) =>
    trackedInvoke("cmd_git_cherry_pick_continue", params),
  gitCherryPickAbort: (params: { rootPath: string }) =>
    trackedInvoke("cmd_git_cherry_pick_abort", params),
  gitBisect: (params: {
    rootPath: string;
    op: "start" | "good" | "bad" | "skip" | "reset";
    args?: string[];
  }) => trackedInvoke("cmd_git_bisect", params),
  gitReflog: (params: {
    rootPath: string;
    refName?: string;
    maxCount?: number;
  }) => trackedInvoke("cmd_git_reflog", params),

  // Phase 4 git tools — tags / remotes / submodules / worktree writes
  gitTagCreate: (params: {
    rootPath: string;
    name: string;
    refName?: string;
    message?: string;
    annotated?: boolean;
  }) => trackedInvoke("cmd_git_tag_create", params),
  gitTagDelete: (params: { rootPath: string; names: string[] }) =>
    trackedInvoke("cmd_git_tag_delete", params),
  gitTagList: (params: { rootPath: string; pattern?: string }) =>
    trackedInvoke("cmd_git_tag_list", params),
  gitTagPush: (params: {
    rootPath: string;
    remote?: string;
    name?: string;
    all?: boolean;
  }) => trackedInvoke("cmd_git_tag_push", params),
  gitRemoteList: (params: { rootPath: string }) =>
    trackedInvoke("cmd_git_remote_list", params),
  gitRemoteAdd: (params: { rootPath: string; name: string; url: string }) =>
    trackedInvoke("cmd_git_remote_add", params),
  gitRemoteRemove: (params: { rootPath: string; name: string }) =>
    trackedInvoke("cmd_git_remote_remove", params),
  gitRemoteSetUrl: (params: {
    rootPath: string;
    name: string;
    url: string;
    push?: boolean;
  }) => trackedInvoke("cmd_git_remote_set_url", params),
  gitSubmoduleStatus: (params: { rootPath: string; recursive?: boolean }) =>
    trackedInvoke("cmd_git_submodule_status", params),
  gitSubmoduleUpdate: (params: {
    rootPath: string;
    init?: boolean;
    recursive?: boolean;
    paths?: string[];
  }) => trackedInvoke("cmd_git_submodule_update", params),
  gitSubmoduleAdd: (params: { rootPath: string; repo: string; path: string }) =>
    trackedInvoke("cmd_git_submodule_add", params),
  gitSubmoduleSync: (params: { rootPath: string; recursive?: boolean }) =>
    trackedInvoke("cmd_git_submodule_sync", params),
  gitWorktreeAdd: (params: {
    rootPath: string;
    path: string;
    branch?: string;
    newBranch?: string;
  }) => trackedInvoke("cmd_git_worktree_add", params),
  gitWorktreeRemove: (params: {
    rootPath: string;
    path: string;
    force?: boolean;
  }) => trackedInvoke("cmd_git_worktree_remove", params),
  gitWorktreePrune: (params: { rootPath: string }) =>
    trackedInvoke("cmd_git_worktree_prune", params),

  // Phase 5 git tools — patches / archive / notes / inspection / config / clone / init
  gitApplyPatch: (params: {
    rootPath: string;
    patchText: string;
    check?: boolean;
    threeWay?: boolean;
  }) => trackedInvoke("cmd_git_apply_patch", params),
  gitFormatPatch: (params: { rootPath: string; range: string }) =>
    trackedInvoke("cmd_git_format_patch", params),
  gitAm: (params: {
    rootPath: string;
    patchText: string;
    threeWay?: boolean;
  }) => trackedInvoke("cmd_git_am", params),
  gitArchive: (params: {
    rootPath: string;
    refName: string;
    format?: string;
    outputPath?: string;
  }) => trackedInvoke("cmd_git_archive", params),
  gitNotesShow: (params: { rootPath: string; refName?: string }) =>
    trackedInvoke("cmd_git_notes_show", params),
  gitNotesAdd: (params: {
    rootPath: string;
    message: string;
    refName?: string;
  }) => trackedInvoke("cmd_git_notes_add", params),
  gitNotesRemove: (params: { rootPath: string; refName?: string }) =>
    trackedInvoke("cmd_git_notes_remove", params),
  gitDescribe: (params: {
    rootPath: string;
    refName?: string;
    dirty?: boolean;
    abbrev?: number;
  }) => trackedInvoke("cmd_git_describe", params),
  gitShow: (params: {
    rootPath: string;
    refName: string;
    path?: string;
    maxLines?: number;
  }) => trackedInvoke("cmd_git_show", params),
  gitLsFiles: (params: {
    rootPath: string;
    patterns?: string[];
    staged?: boolean;
    modified?: boolean;
    untracked?: boolean;
  }) => trackedInvoke("cmd_git_ls_files", params),
  gitLsTree: (params: {
    rootPath: string;
    refName: string;
    path?: string;
    recursive?: boolean;
  }) => trackedInvoke("cmd_git_ls_tree", params),
  gitGrep: (params: {
    rootPath: string;
    pattern: string;
    refName?: string;
    includePattern?: string;
    maxResults?: number;
  }) => trackedInvoke("cmd_git_grep", params),
  gitConfigGet: (params: {
    rootPath: string;
    key: string;
    scope?: "local" | "global" | "system";
  }) => trackedInvoke("cmd_git_config_get", params),
  gitConfigSet: (params: {
    rootPath: string;
    key: string;
    value: string;
    scope?: "local" | "global" | "system";
  }) => trackedInvoke("cmd_git_config_set", params),
  gitClone: (params: {
    url: string;
    targetPath: string;
    branch?: string;
    depth?: number;
  }) => trackedInvoke("cmd_git_clone", params),
  gitInit: (params: {
    targetPath: string;
    bare?: boolean;
    initialBranch?: string;
  }) => trackedInvoke("cmd_git_init", params),

  // Time Machine
  openDebugPanel: async () => {
    const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow");
    new WebviewWindow("debug", {
      url: "/?mode=debug",
      title: "Debug Panel — API Inspector",
      width: 1200,
      height: 800,
      contentProtected: await getPreventScreenCapture(),
    });
    return { success: true };
  },
  openAppInNewWindow: async (
    app: string,
    label: string,
    opts?: { x?: number; y?: number },
  ) => {
    const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow");
    const windowOpts: Record<string, unknown> = {
      url: `/?mode=standalone&app=${app}`,
      title: `Genisys — ${label}`,
      width: 1200,
      height: 800,
      minWidth: 600,
      minHeight: 400,
      // Spawn hidden to avoid the white flash while Vite/React boot inside
      // the new window. The standalone GenisysApp branch shows + focuses the
      // window from `useShowCurrentWindowOnMount` once React has mounted.
      visible: false,
      contentProtected: await getPreventScreenCapture(),
    };
    if (opts && typeof opts.x === "number" && typeof opts.y === "number") {
      windowOpts.x = opts.x;
      windowOpts.y = opts.y;
    }
    new WebviewWindow(
      `app-${app}-${Date.now()}`,
      windowOpts as ConstructorParameters<typeof WebviewWindow>[1],
    );
    return { success: true };
  },
  // Workspace grep & find (used by Context Agent)
  grepSearch: (params: {
    rootPath: string;
    pattern: string;
    includePattern?: string;
    maxResults?: number;
    isRegex?: boolean;
  }) =>
    trackedInvoke<{
      success: boolean;
      data?: Array<{
        filePath: string;
        lineNumber: number;
        lineContent: string;
        contextBefore: string[];
        contextAfter: string[];
      }>;
      totalMatches?: number;
      error?: string;
    }>("cmd_grep_search", {
      rootPath: params.rootPath,
      pattern: params.pattern,
      includePattern: params.includePattern ?? null,
      maxResults: params.maxResults ?? null,
      isRegex: params.isRegex ?? null,
    }),
  findFiles: (params: {
    rootPath: string;
    pattern: string;
    maxResults?: number;
  }) =>
    trackedInvoke<{
      success: boolean;
      data?: string[];
      error?: string;
    }>("cmd_find_files", {
      rootPath: params.rootPath,
      pattern: params.pattern,
      maxResults: params.maxResults ?? null,
    }),

  // BYOK AI Providers (bring your own key)
  getAiProviders: () =>
    trackedInvoke<{
      openai: { configured: boolean };
      anthropic: { configured: boolean };
      google: { configured: boolean };
      custom: { configured: boolean; baseUrl?: string | null; models?: string[] };
    }>("cmd_get_ai_providers"),
  setAiProviderKey: (
    provider: string,
    apiKey: string,
    baseUrl?: string,
    models?: string[],
  ) =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_set_ai_provider_key",
      {
        provider,
        apiKey,
        baseUrl: baseUrl ?? null,
        models: models ?? null,
      },
    ),
  clearAiProviderKey: (provider: string) =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_clear_ai_provider_key",
      { provider },
    ),

  // Chat
  sendChatMessage: (params: any) =>
    trackedInvoke("cmd_chat_send_message", params),
  crawlWebpage: (url: string) =>
    trackedInvoke<{
      success: boolean;
      url?: string;
      title?: string;
      description?: string;
      content?: string;
      internalLinks?: { text: string; href: string }[];
      externalLinks?: { text: string; href: string }[];
      error?: string;
    }>("cmd_crawl_webpage", { url }),
  crawlWebpageLite: (url: string) =>
    trackedInvoke<{
      success: boolean;
      url?: string;
      title?: string;
      description?: string;
      content?: string;
      error?: string;
    }>("cmd_crawl_webpage_lite", { url }),
  executeSingleTool: (
    toolName: string,
    args: Record<string, unknown>,
    repoPath?: string,
  ) =>
    trackedInvoke<string>("cmd_execute_single_tool", {
      toolName,
      args,
      repoPath: repoPath ?? null,
    }),
  abortChatStream: (_streamId: string) => {
    /* handled server-side */
  },
  onChatStreamChunk: (callback: (data: any) => void) => {
    const unlisten = listen("chat-stream-chunk", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onChatStreamDone: (callback: (data: any) => void) => {
    const unlisten = listen("chat-stream-done", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onChatStreamError: (callback: (data: any) => void) => {
    const unlisten = listen("chat-stream-error", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onChatStreamToolStart: (callback: (data: any) => void) => {
    const unlisten = listen("chat-stream-tool-start", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onChatStreamToolResult: (callback: (data: any) => void) => {
    const unlisten = listen("chat-stream-tool-result", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onChatStreamReasoningChunk: (callback: (data: any) => void) => {
    const unlisten = listen("chat-stream-reasoning-chunk", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },

  // Chat History
  loadChatHistory: () => trackedInvoke("cmd_load_chat_history"),
  loadChatList: () => trackedInvoke("cmd_load_chat_list"),
  loadConversationMessages: (
    conversationId: string,
    beforeSortOrder: number | null,
    limit: number,
  ) =>
    trackedInvoke("cmd_load_conversation_messages", {
      conversationId,
      beforeSortOrder,
      limit,
    }),
  saveChatConversation: (conversation: any) =>
    trackedInvoke("cmd_save_chat_conversation", { conversation }),
  /**
   * Persist a pasted/attached chat image to disk (`<app_data>/chat-images/`).
   * Pass EITHER `dataUrl` (base64 data URI, e.g. from clipboard paste) OR
   * `sourcePath` (absolute path from the file picker). Returns the stored
   * `filename` (to attach to the message) and a `dataUrl` for preview.
   */
  saveChatImage: (params: { dataUrl?: string; sourcePath?: string }) =>
    trackedInvoke<{
      success: boolean;
      filename?: string;
      dataUrl?: string;
      error?: string;
    }>("cmd_save_chat_image", params),
  /** Read a stored chat image by filename and return a base64 data URI. */
  getChatImage: (filename: string) =>
    trackedInvoke<{ success: boolean; dataUrl?: string; error?: string }>(
      "cmd_get_chat_image",
      { filename },
    ),
  appendChatMessage: (
    conversationId: string,
    title: string,
    createdAt: string,
    updatedAt: string,
    message: any,
  ) =>
    trackedInvoke("cmd_append_chat_message", {
      conversationId,
      title,
      createdAt,
      updatedAt,
      message,
    }),
  removeChatConversation: (conversationId: string) =>
    trackedInvoke("cmd_remove_chat_conversation", { conversationId }),
  clearChatHistory: () => trackedInvoke("cmd_clear_chat_history"),

  // AI Assistant Sessions
  loadAIAssistantSessions: (appId: string, scopeKey?: string) =>
    trackedInvoke("cmd_load_ai_sessions", { appId, scopeKey }),
  saveAIAssistantSession: (session: {
    id: string;
    appId: string;
    scopeKey?: string;
    conversationId: string;
    title: string;
    createdAt: string;
    updatedAt: string;
  }) => trackedInvoke("cmd_save_ai_session", { session }),
  removeAIAssistantSession: (sessionId: string) =>
    trackedInvoke("cmd_remove_ai_session", { sessionId }),
  clearAIAssistantSessions: (appId: string, scopeKey?: string, exceptSessionId?: string) =>
    trackedInvoke("cmd_clear_ai_sessions", { appId, scopeKey, exceptSessionId }),

  // Tool Calls
  saveToolCalls: (toolCalls: any[]) =>
    trackedInvoke("cmd_save_tool_calls", { toolCalls }),
  loadToolCalls: (conversationId: string) =>
    trackedInvoke("cmd_load_tool_calls", { conversationId }),
  loadToolCallSummaries: (conversationId: string) =>
    trackedInvoke("cmd_load_tool_call_summaries", { conversationId }),
  loadToolCallsByMessage: (messageId: string) =>
    trackedInvoke("cmd_load_tool_calls_by_message", { messageId }),

  // Prompts
  loadPrompts: () => trackedInvoke("cmd_load_prompts"),
  savePrompt: (prompt: any) => trackedInvoke("cmd_save_prompt", { prompt }),
  removePrompt: (promptId: string) =>
    trackedInvoke("cmd_remove_prompt", { promptId }),
  togglePromptFavorite: (promptId: string) =>
    trackedInvoke("cmd_toggle_prompt_favorite", { promptId }),
  incrementPromptUsage: (promptId: string) =>
    trackedInvoke("cmd_increment_prompt_usage", { promptId }),

  // Snippets
  loadSnippets: () => trackedInvoke("cmd_load_snippets"),
  saveSnippet: (snippet: any) => trackedInvoke("cmd_save_snippet", { snippet }),
  removeSnippet: (snippetId: string) =>
    trackedInvoke("cmd_remove_snippet", { snippetId }),
  toggleSnippetFavorite: (snippetId: string) =>
    trackedInvoke("cmd_toggle_snippet_favorite", { snippetId }),

  // Previewer
  fetchLinkPreview: (url: string) =>
    trackedInvoke("cmd_fetch_link_preview", { url }),
  previewerLoadAll: () => trackedInvoke("cmd_previewer_load_all"),
  previewerSaveFolder: (folder: unknown) =>
    trackedInvoke("cmd_previewer_save_folder", { folder }),
  previewerRemoveFolder: (folderId: string) =>
    trackedInvoke("cmd_previewer_remove_folder", { folderId }),
  previewerSavePreview: (preview: unknown) =>
    trackedInvoke("cmd_previewer_save_preview", { preview }),
  previewerSavePreviews: (previews: unknown) =>
    trackedInvoke("cmd_previewer_save_previews", { previews }),
  previewerRemovePreview: (previewId: string) =>
    trackedInvoke("cmd_previewer_remove_preview", { previewId }),
  previewerClearAll: () => trackedInvoke("cmd_previewer_clear_all"),
  listBrowserBookmarkSources: () =>
    trackedInvoke("cmd_list_browser_bookmark_sources"),
  importBrowserBookmarks: (browser: string, profilePath: string) =>
    trackedInvoke("cmd_import_browser_bookmarks", { browser, profilePath }),
  previewerExtractUrlsFromImage: (imageDataUrl: string, model?: string) =>
    trackedInvoke("cmd_previewer_extract_urls_from_image", { imageDataUrl, model }),

  // Previewer — native child webview overlay (renders sites that block iframes)
  previewerWebviewShow: (
    url: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ) =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_previewer_webview_show",
      { url, x, y, width, height },
    ),
  previewerWebviewSetBounds: (
    x: number,
    y: number,
    width: number,
    height: number,
  ) =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_previewer_webview_set_bounds",
      { x, y, width, height },
    ),
  previewerWebviewHide: () =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_previewer_webview_hide",
    ),
  previewerWebviewReload: () =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_previewer_webview_reload",
    ),
  previewerWebviewClose: () =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_previewer_webview_close",
    ),

  // Chat Commands
  loadCommands: () => trackedInvoke("cmd_load_commands"),
  saveCommand: (command: any) => trackedInvoke("cmd_save_command", { command }),
  removeCommand: (commandId: string) =>
    trackedInvoke("cmd_remove_command", { commandId }),

  // ── Prompt Manager ─────────────────────────────────────────────
  pmLoadAll: () => trackedInvoke("cmd_pm_load_all"),
  pmSaveFolder: (folder: any) =>
    trackedInvoke("cmd_pm_save_folder", { folder }),
  pmRemoveFolder: (folderId: string) =>
    trackedInvoke("cmd_pm_remove_folder", { folderId }),
  pmSaveCategory: (category: any) =>
    trackedInvoke("cmd_pm_save_category", { category }),
  pmRemoveCategory: (categoryId: string) =>
    trackedInvoke("cmd_pm_remove_category", { categoryId }),
  pmSavePrompt: (prompt: any) =>
    trackedInvoke("cmd_pm_save_prompt", { prompt }),
  pmRemovePrompt: (promptId: string) =>
    trackedInvoke("cmd_pm_remove_prompt", { promptId }),

  // Select markdown files from local filesystem (multi-select)
  selectMarkdownFiles: async () => {
    const selected = await open({
      multiple: true,
      filters: [{ name: "Markdown", extensions: ["md", "mdx", "markdown"] }],
    });
    if (selected) {
      const paths = Array.isArray(selected) ? selected : [selected];
      return { success: true, data: paths } as {
        success: true;
        data: string[];
      };
    }
    return { success: false, error: "No files selected" } as {
      success: false;
      error: string;
    };
  },

  // Select a single HTML file from local filesystem (single-select)
  selectHtmlFile: async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: "HTML", extensions: ["html", "htm"] }],
    });
    if (typeof selected === "string") {
      return { success: true, data: selected } as {
        success: true;
        data: string;
      };
    }
    return { success: false, error: "No file selected" } as {
      success: false;
      error: string;
    };
  },

  // Read a text file by absolute path (reuses local file content command)
  readTextFile: (absolutePath: string) =>
    trackedInvoke<{ success: boolean; data?: string; error?: string }>(
      "cmd_get_local_file_content",
      { rootPath: "/", filePath: absolutePath },
    ),

  // ── Code walker (gitignore-aware folder walker + UTF-8 file reader) ──
  // Used by CodeReview / Autoflow's `Read Folder` source node to collect
  // additional AI context. Backed by `cmd_code_walk` + `cmd_code_read_file`.
  codeWalk: (root: string) =>
    trackedInvoke<{
      success: boolean;
      data?: { files: string[]; truncated: boolean };
      error?: string;
    }>("cmd_code_walk", { root }),

  codeReadFile: (path: string) =>
    trackedInvoke<{
      success: boolean;
      data?: { binary: boolean; content?: string; size: number };
      error?: string;
    }>("cmd_code_read_file", { path }),

  codeReadFileAsDataUrl: (path: string) =>
    trackedInvoke<{
      success: boolean;
      data?: { dataUrl: string; mimeType: string; sizeBytes: number };
      error?: string;
    }>("cmd_code_read_file_as_data_url", { path }),

  // Generic folder picker (native OS directory dialog). Returns the absolute
  // path string on success, or an error result when the user cancels.
  pickFolder: async () => {
    const selected = await open({ directory: true, multiple: false });
    if (typeof selected === "string")
      return { success: true as const, data: selected };
    return { success: false as const, error: "No directory selected" };
  },

  // Native image-file picker. Returns the absolute path on success, or an
  // error result when the user cancels.
  pickImageFile: async () => {
    const selected = await open({
      directory: false,
      multiple: false,
      filters: [
        {
          name: "Images",
          extensions: ["png", "jpg", "jpeg", "gif", "webp", "bmp"],
        },
      ],
    });
    if (typeof selected === "string")
      return { success: true as const, data: selected };
    return { success: false as const, error: "No image selected" };
  },

  // WebPoint (AI Presentations)
  loadPresentations: () => trackedInvoke("cmd_load_presentations"),
  savePresentation: (presentation: any) =>
    trackedInvoke("cmd_save_presentation", { presentation }),
  removePresentation: (presentationId: string) =>
    trackedInvoke("cmd_remove_presentation", { presentationId }),
  loadPresentationWithSlides: (presentationId: string) =>
    trackedInvoke("cmd_load_presentation_with_slides", { presentationId }),
  saveSlide: (slide: any) => trackedInvoke("cmd_save_slide", { slide }),
  removeSlide: (slideId: string) =>
    trackedInvoke("cmd_remove_slide", { slideId }),
  reorderSlides: (presentationId: string, slideIds: string[]) =>
    trackedInvoke("cmd_reorder_slides", { presentationId, slideIds }),
  webpointStageSlide: (slideId: string, html: string) =>
    trackedInvoke("cmd_webpoint_stage_slide", { slideId, html }),

  // Library (Books & Chapters)
  loadBooks: () => trackedInvoke("cmd_load_books"),
  saveBook: (book: any) => trackedInvoke("cmd_save_book", { book }),
  removeBook: (bookId: string) => trackedInvoke("cmd_remove_book", { bookId }),
  loadBookWithChapters: (bookId: string) =>
    trackedInvoke("cmd_load_book_with_chapters", { bookId }),
  loadChapterContent: (chapterId: string) =>
    trackedInvoke<string | null>("cmd_load_chapter_content", { chapterId }),
  saveChapter: (chapter: any) => trackedInvoke("cmd_save_chapter", { chapter }),
  saveChapterTranslation: (translation: any) =>
    trackedInvoke("cmd_save_chapter_translation", { translation }),
  loadChapterTranslations: (chapterId: string) =>
    trackedInvoke<any[]>("cmd_load_chapter_translations", { chapterId }),
  loadChapterTranslationContent: (chapterId: string, language: string) =>
    trackedInvoke<string | null>("cmd_load_chapter_translation_content", {
      chapterId,
      language,
    }),
  removeChapterTranslation: (chapterId: string, language: string) =>
    trackedInvoke("cmd_remove_chapter_translation", { chapterId, language }),
  removeChapter: (chapterId: string, bookId: string) =>
    trackedInvoke("cmd_remove_chapter", { chapterId, bookId }),

  // Library (Bookmarks)
  loadBookmarks: () => trackedInvoke("cmd_load_bookmarks"),
  loadBookmarksForChapter: (chapterId: string) =>
    trackedInvoke("cmd_load_bookmarks_for_chapter", { chapterId }),
  saveBookmark: (bookmark: any) =>
    trackedInvoke("cmd_save_bookmark", { bookmark }),
  removeBookmark: (bookmarkId: string) =>
    trackedInvoke("cmd_remove_bookmark", { bookmarkId }),

  // Library (Offline Image Cache)
  cacheChapterImages: (
    bookId: string,
    chapterId: string,
    chapterMarkdown: string,
  ) =>
    trackedInvoke<{ images: CachedImageRecord[] }>("cmd_cache_chapter_images", {
      bookId,
      chapterId,
      chapterMarkdown,
    }),
  loadChapterImages: (bookId: string, chapterId: string) =>
    trackedInvoke<CachedImageRecord[]>("cmd_load_chapter_images", {
      bookId,
      chapterId,
    }),
  loadCachedImageAsDataUrl: (bookId: string, filename: string) =>
    trackedInvoke<string>("cmd_load_cached_image_as_data_url", {
      bookId,
      filename,
    }),
  removeBookImages: (bookId: string) =>
    trackedInvoke<{ success: boolean }>("cmd_remove_book_images", { bookId }),

  // Saved Webpages
  loadWebpages: () => trackedInvoke<any[]>("cmd_load_webpages"),
  saveWebpage: (url: string, name: string, createdAt: string) =>
    trackedInvoke<{ success: boolean; webpage: any }>("cmd_save_webpage", {
      url,
      name,
      createdAt,
    }),
  removeWebpage: (id: string) =>
    trackedInvoke<{ success: boolean }>("cmd_remove_webpage", { id }),
  loadWebpageContent: (id: string) =>
    trackedInvoke<string>("cmd_load_webpage_content", { id }),
  updateWebpage: (id: string, updatedAt: string) =>
    trackedInvoke<{ success: boolean; fileSize: number; updatedAt: string }>(
      "cmd_update_webpage",
      { id, updatedAt },
    ),
  saveWebpageFromHtml: (
    html: string,
    name: string,
    sourceUrl: string,
    createdAt: string,
  ) =>
    trackedInvoke<{ success: boolean; webpage: any }>(
      "cmd_save_webpage_from_html",
      { html, name, sourceUrl, createdAt },
    ),
  renameWebpage: (id: string, name: string, updatedAt: string) =>
    trackedInvoke<{ success: boolean; updatedAt: string }>(
      "cmd_rename_webpage",
      { id, name, updatedAt },
    ),
  updateWebpageContent: (id: string, html: string, updatedAt: string) =>
    trackedInvoke<{ success: boolean; fileSize: number; updatedAt: string }>(
      "cmd_update_webpage_content",
      { id, html, updatedAt },
    ),

  // Export (write binary files to disk)
  writeBinaryFile: (path: string, data: number[]) =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_write_binary_file",
      { path, data },
    ),

  // Zoom
  zoomIn: async () => {
    const level = await trackedInvoke<number>("cmd_zoom_in");
    void emit("zoom-changed", level);
    return level;
  },
  zoomOut: async () => {
    const level = await trackedInvoke<number>("cmd_zoom_out");
    void emit("zoom-changed", level);
    return level;
  },
  zoomReset: async () => {
    const level = await trackedInvoke<number>("cmd_zoom_reset");
    void emit("zoom-changed", level);
    return level;
  },
  getZoomLevel: () => trackedInvoke<number>("cmd_get_zoom_level"),
  onZoomChanged: (callback: (level: number) => void) => {
    const unlisten = listen("zoom-changed", (event) =>
      callback(event.payload as number),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },

  // Debug
  onDebugEvent: (callback: DebugCallback) => {
    debugListeners.add(callback);
    return () => {
      debugListeners.delete(callback);
    };
  },

  // Data Management
  deleteAllData: () => trackedInvoke("cmd_delete_all_data"),
  resetAllSettings: () => trackedInvoke("cmd_reset_all_settings"),

  // DB Explorer
  getTableNames: () => trackedInvoke<string[]>("cmd_get_table_names"),
  executeRawQuery: (query: string, isWrite: boolean) =>
    trackedInvoke<{
      success: boolean;
      columns?: string[];
      rows?: unknown[][];
      count?: number;
      changes?: number;
      error?: string;
    }>("cmd_execute_raw_query", { query, isWrite }),

  // ── Chat-attached sources (research_sources table) + shared research streaming used by Chat/ExplainSelection ──
  loadResearchSources: (sessionId: string) =>
    trackedInvoke("cmd_load_research_sources", { sessionId }),
  saveResearchSource: (source: any) =>
    trackedInvoke("cmd_save_research_source", { source }),
  removeResearchSource: (sourceId: string) =>
    trackedInvoke("cmd_remove_research_source", { sourceId }),

  // File picker used by Chat SourceManager / ChatMain
  selectResearchFiles: async () => {
    const selected = await open({
      multiple: true,
      filters: [
        {
          name: "Documents, Code & Images",
          extensions: [
            "md",
            "mdx",
            "markdown",
            "txt",
            "text",
            "ts",
            "tsx",
            "js",
            "jsx",
            "mjs",
            "cjs",
            "py",
            "rs",
            "go",
            "java",
            "c",
            "cpp",
            "h",
            "hpp",
            "cs",
            "rb",
            "php",
            "swift",
            "kt",
            "dart",
            "lua",
            "r",
            "scala",
            "json",
            "yaml",
            "yml",
            "toml",
            "xml",
            "csv",
            "css",
            "scss",
            "less",
            "html",
            "htm",
            "svg",
            "sh",
            "bash",
            "zsh",
            "sql",
            "graphql",
            "proto",
            "env",
            "ini",
            "cfg",
            "conf",
            "png",
            "jpg",
            "jpeg",
            "gif",
            "webp",
            "bmp",
            "ico",
            "pdf",
          ],
        },
      ],
    });
    if (selected) {
      const paths = Array.isArray(selected) ? selected : [selected];
      return { success: true, data: paths } as {
        success: true;
        data: string[];
      };
    }
    return { success: false, error: "No files selected" } as {
      success: false;
      error: string;
    };
  },

  // Research streaming — used by Chat (source-attached queries) and ExplainSelection
  sendResearchQuery: (params: any) =>
    trackedInvoke("cmd_research_send_query", params),
  abortResearchStream: (_streamId: string) => {
    /* handled server-side */
  },
  onResearchStreamChunk: (callback: (data: any) => void) => {
    const unlisten = listen("research-stream-chunk", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onResearchStreamDone: (callback: (data: any) => void) => {
    const unlisten = listen("research-stream-done", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onResearchStreamError: (callback: (data: any) => void) => {
    const unlisten = listen("research-stream-error", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },

  // ── Notifications ──────────────────────────────────────────────
  saveNotification: (notification: any) =>
    trackedInvoke("cmd_save_notification", { notification }),
  loadNotifications: (
    beforeCursor?: string,
    pageSize?: number,
    filters?: {
      notificationType?: string;
      channel?: string;
      source?: string;
      read?: boolean;
    },
  ) =>
    trackedInvoke<{
      items: any[];
      hasMore: boolean;
    }>("cmd_load_notifications", { beforeCursor, pageSize, filters }),
  removeNotification: (id: string) =>
    trackedInvoke("cmd_remove_notification", { id }),
  removeAllNotifications: () =>
    trackedInvoke("cmd_remove_all_notifications", {}),
  markNotificationRead: (id: string) =>
    trackedInvoke("cmd_mark_notification_read", { id }),
  markAllNotificationsRead: () =>
    trackedInvoke("cmd_mark_all_notifications_read", {}),
  countUnreadNotifications: () =>
    trackedInvoke<number>("cmd_count_unread_notifications", {}),

  // ── API Client ─────────────────────────────────────────────────
  apiLoadAll: () =>
    trackedInvoke<{
      collections: any[];
      folders: any[];
      requests: any[];
      environments: any[];
      activeEnvironmentId: string | null;
      workspaces: any[];
    }>("cmd_api_load_all"),
  apiLoadRequestBody: (requestId: string) =>
    trackedInvoke<string | null>("cmd_api_load_request_body", { requestId }),
  apiSaveCollection: (collection: any) =>
    trackedInvoke("cmd_api_save_collection", { collection }),
  apiSaveFolder: (folder: any) =>
    trackedInvoke("cmd_api_save_folder", { folder }),
  apiSaveRequest: (request: any) =>
    trackedInvoke("cmd_api_save_request", { request }),
  apiRemoveCollection: (collectionId: string) =>
    trackedInvoke("cmd_api_remove_collection", { collectionId }),
  apiRemoveFolder: (folderId: string) =>
    trackedInvoke("cmd_api_remove_folder", { folderId }),
  apiRemoveRequest: (requestId: string) =>
    trackedInvoke("cmd_api_remove_request", { requestId }),
  apiSendRequest: (payload: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: string;
    requestId?: string;
    requestName?: string;
    environmentId?: string;
    workspaceId?: string;
    sendId?: string;
  }) =>
    trackedInvoke<{
      status: number;
      statusText: string;
      headers: Record<string, string>;
      body: string;
      time: number;
      size: number;
      executionId: string;
    }>("cmd_api_send_request", { payload }),
  apiCancelRequest: (sendId: string) =>
    trackedInvoke("cmd_api_cancel_request", { sendId }),

  // ── Environments ──────────────────────────────────────────────
  apiSaveEnvironment: (environment: any) =>
    trackedInvoke("cmd_api_save_environment", { environment }),
  apiSetActiveEnvironment: (workspaceId: string, environmentId: string) =>
    trackedInvoke("cmd_api_set_active_environment", {
      workspaceId,
      environmentId,
    }),
  apiRemoveEnvironment: (environmentId: string) =>
    trackedInvoke("cmd_api_remove_environment", { environmentId }),
  apiLoadEnvironmentVariables: (environmentId: string) =>
    trackedInvoke<any[]>("cmd_api_load_environment_variables", {
      environmentId,
    }),
  apiSaveEnvironmentVariable: (variable: any) =>
    trackedInvoke("cmd_api_save_environment_variable", { variable }),
  apiRemoveEnvironmentVariable: (variableId: string) =>
    trackedInvoke("cmd_api_remove_environment_variable", { variableId }),

  // ── History ───────────────────────────────────────────────────
  apiLoadHistory: (workspaceId: string, limit?: number, offset?: number) =>
    trackedInvoke<any[]>("cmd_api_load_history", {
      workspaceId,
      limit,
      offset,
    }),
  apiLoadExecutionResponse: (executionId: string) =>
    trackedInvoke<any>("cmd_api_load_execution_response", { executionId }),
  apiRemoveExecution: (executionId: string) =>
    trackedInvoke("cmd_api_remove_execution", { executionId }),
  apiClearHistory: (workspaceId: string) =>
    trackedInvoke("cmd_api_clear_history", { workspaceId }),
  apiLoadRequestAnalytics: (requestId: string, since: string) =>
    trackedInvoke<any[]>("cmd_api_load_request_analytics", {
      requestId,
      since,
    }),

  // ── Cookies ───────────────────────────────────────────────────
  apiLoadCookieJars: (workspaceId: string) =>
    trackedInvoke<any[]>("cmd_api_load_cookie_jars", { workspaceId }),
  apiLoadCookies: (jarId: string) =>
    trackedInvoke<any[]>("cmd_api_load_cookies", { jarId }),
  apiSaveCookieJar: (jar: any) =>
    trackedInvoke("cmd_api_save_cookie_jar", { jar }),
  apiSaveCookie: (cookie: any) =>
    trackedInvoke("cmd_api_save_cookie", { cookie }),
  apiRemoveCookie: (cookieId: string) =>
    trackedInvoke("cmd_api_remove_cookie", { cookieId }),
  apiClearCookieJar: (jarId: string) =>
    trackedInvoke("cmd_api_clear_cookie_jar", { jarId }),

  // ── Snapshots & Examples ──────────────────────────────────────
  apiSaveResponseSnapshot: (snapshot: any) =>
    trackedInvoke("cmd_api_save_response_snapshot", { snapshot }),
  apiLoadResponseSnapshots: (requestId: string) =>
    trackedInvoke<any[]>("cmd_api_load_response_snapshots", { requestId }),
  apiRemoveResponseSnapshot: (snapshotId: string) =>
    trackedInvoke("cmd_api_remove_response_snapshot", { snapshotId }),
  apiSaveExample: (example: any) =>
    trackedInvoke("cmd_api_save_example", { example }),
  apiLoadExamples: (requestId: string) =>
    trackedInvoke<any[]>("cmd_api_load_examples", { requestId }),
  apiRemoveExample: (exampleId: string) =>
    trackedInvoke("cmd_api_remove_example", { exampleId }),

  // ── Notes ─────────────────────────────────────────────────────
  loadNotes: (appId: string, scopeType: string, scopeId: string) =>
    trackedInvoke<any[]>("cmd_load_notes", { appId, scopeType, scopeId }),
  loadAllNotes: () => trackedInvoke<any[]>("cmd_load_all_notes", {}),
  saveNote: (note: any) => trackedInvoke("cmd_save_note", { note }),
  removeNote: (noteId: string) => trackedInvoke("cmd_remove_note", { noteId }),
  toggleNotePin: (noteId: string) =>
    trackedInvoke("cmd_toggle_note_pin", { noteId }),
  searchNoteSuggestions: (appId: string, query: string) =>
    trackedInvoke<any[]>("cmd_search_note_suggestions", { appId, query }),

  // ── Note Highlights ───────────────────────────────────────────
  loadNoteHighlights: (noteId: string) =>
    trackedInvoke<any[]>("cmd_load_note_highlights", { noteId }),
  saveNoteHighlight: (highlight: any) =>
    trackedInvoke("cmd_save_note_highlight", { highlight }),
  removeNoteHighlight: (highlightId: string) =>
    trackedInvoke("cmd_remove_note_highlight", { highlightId }),
  removeNoteHighlightsInRange: (
    noteId: string,
    fromPos: number,
    toPos: number,
  ) =>
    trackedInvoke("cmd_remove_note_highlights_in_range", {
      noteId,
      fromPos,
      toPos,
    }),

  // ── Note Notebooks ────────────────────────────────────────────
  loadNoteNotebooks: () => trackedInvoke<any[]>("cmd_load_note_notebooks", {}),
  saveNoteNotebook: (notebook: any) =>
    trackedInvoke("cmd_save_note_notebook", { notebook }),
  removeNoteNotebook: (notebookId: string) =>
    trackedInvoke("cmd_remove_note_notebook", { notebookId }),
  reorderNoteNotebooks: (orderedIds: string[]) =>
    trackedInvoke("cmd_reorder_note_notebooks", { orderedIds }),
  moveNoteNotebook: (notebookId: string, newProjectId: string | null) =>
    trackedInvoke("cmd_move_note_notebook", { notebookId, newProjectId }),

  // ── Note Projects ─────────────────────────────────────────────
  loadNoteProjects: () => trackedInvoke<any[]>("cmd_load_note_projects", {}),
  saveNoteProject: (project: any) =>
    trackedInvoke("cmd_save_note_project", { project }),
  removeNoteProject: (projectId: string) =>
    trackedInvoke("cmd_remove_note_project", { projectId }),
  reorderNoteProjects: (orderedIds: string[]) =>
    trackedInvoke("cmd_reorder_note_projects", { orderedIds }),

  // ── Note Sections ─────────────────────────────────────────────
  loadNoteSections: (notebookId?: string) =>
    trackedInvoke<any[]>("cmd_load_note_sections", {
      notebookId: notebookId ?? null,
    }),
  saveNoteSection: (section: any) =>
    trackedInvoke("cmd_save_note_section", { section }),
  removeNoteSection: (sectionId: string) =>
    trackedInvoke("cmd_remove_note_section", { sectionId }),
  reorderNoteSections: (orderedIds: string[]) =>
    trackedInvoke("cmd_reorder_note_sections", { orderedIds }),
  moveNoteSection: (sectionId: string, newNotebookId: string) =>
    trackedInvoke("cmd_move_note_section", { sectionId, newNotebookId }),

  // ── Note Topics ───────────────────────────────────────────────
  loadNoteTopics: (sectionId?: string) =>
    trackedInvoke<any[]>("cmd_load_note_topics", {
      sectionId: sectionId ?? null,
    }),
  saveNoteTopic: (topic: any) =>
    trackedInvoke("cmd_save_note_topic", { topic }),
  removeNoteTopic: (topicId: string) =>
    trackedInvoke("cmd_remove_note_topic", { topicId }),
  reorderNoteTopics: (orderedIds: string[]) =>
    trackedInvoke("cmd_reorder_note_topics", { orderedIds }),
  moveNoteTopic: (topicId: string, newSectionId: string) =>
    trackedInvoke("cmd_move_note_topic", { topicId, newSectionId }),

  // ── Note Labels ───────────────────────────────────────────────
  loadNoteLabels: () => trackedInvoke<any[]>("cmd_load_note_labels", {}),
  saveNoteLabel: (label: any) =>
    trackedInvoke("cmd_save_note_label", { label }),
  removeNoteLabel: (labelId: string) =>
    trackedInvoke("cmd_remove_note_label", { labelId }),
  setNoteLabels: (noteId: string, labelIds: string[]) =>
    trackedInvoke("cmd_set_note_labels", { noteId, labelIds }),

  // ── Notes (extended operations) ───────────────────────────────
  moveNote: (
    noteId: string,
    notebookId: string | null,
    sectionId: string | null,
    topicId: string | null,
  ) =>
    trackedInvoke("cmd_move_note", { noteId, notebookId, sectionId, topicId }),
  reorderNotes: (orderedIds: string[]) =>
    trackedInvoke("cmd_reorder_notes", { orderedIds }),

  // ── Notes (favorites / trash / duplicate) ─────────────────────
  toggleNoteFavorite: (noteId: string) =>
    trackedInvoke("cmd_toggle_note_favorite", { noteId }),
  trashNote: (noteId: string) => trackedInvoke("cmd_trash_note", { noteId }),
  restoreNoteFromTrash: (noteId: string) =>
    trackedInvoke("cmd_restore_note_from_trash", { noteId }),
  emptyTrash: () => trackedInvoke("cmd_empty_trash", {}),
  duplicateNote: (noteId: string) =>
    trackedInvoke("cmd_duplicate_note", { noteId }),
  loadTrashedNotes: () => trackedInvoke<any[]>("cmd_load_trashed_notes", {}),

  // ── Mock Server ────────────────────────────────────────────────
  // Projects
  mockLoadProjects: () => trackedInvoke<any>("cmd_mock_load_projects"),
  mockCreateProject: (name: string, color: string) =>
    trackedInvoke<any>("cmd_mock_create_project", { name, color }),
  mockUpdateProject: (id: string, name: string, color: string) =>
    trackedInvoke<any>("cmd_mock_update_project", { id, name, color }),
  mockDeleteProject: (id: string) =>
    trackedInvoke<any>("cmd_mock_delete_project", { id }),

  // Servers
  mockLoadServers: () => trackedInvoke<any>("cmd_mock_load_servers"),
  mockCreateServer: (projectId: string, name: string, port: number) =>
    trackedInvoke<any>("cmd_mock_create_server", { projectId, name, port }),
  mockUpdateServer: (
    id: string,
    name: string,
    port: number,
    projectId: string,
  ) =>
    trackedInvoke<any>("cmd_mock_update_server", { id, name, port, projectId }),
  mockDeleteServer: (id: string) =>
    trackedInvoke<any>("cmd_mock_delete_server", { id }),
  mockDuplicateServer: (id: string) =>
    trackedInvoke<any>("cmd_mock_duplicate_server", { id }),

  // Endpoints
  mockLoadEndpoints: (serverId: string) =>
    trackedInvoke<any>("cmd_mock_load_endpoints", { serverId }),
  mockCreateEndpoint: (params: {
    serverId: string;
    method: string;
    path: string;
    statusCode: number;
    responseHeaders: string;
    responseBody: string;
    responseType: string;
    aiPrompt?: string;
    aiSchema?: string;
    aiCount?: number;
    delayMs?: number;
    description?: string;
  }) =>
    trackedInvoke<any>("cmd_mock_create_endpoint", {
      serverId: params.serverId,
      method: params.method,
      path: params.path,
      statusCode: params.statusCode,
      responseHeaders: params.responseHeaders,
      responseBody: params.responseBody,
      responseType: params.responseType,
      aiPrompt: params.aiPrompt ?? null,
      aiSchema: params.aiSchema ?? null,
      aiCount: params.aiCount ?? null,
      delayMs: params.delayMs ?? null,
      description: params.description ?? null,
    }),
  mockUpdateEndpoint: (params: {
    id: string;
    method: string;
    path: string;
    statusCode: number;
    responseHeaders: string;
    responseBody: string;
    responseType: string;
    aiPrompt?: string;
    aiSchema?: string;
    aiCount?: number;
    delayMs?: number;
    description?: string;
    isActive?: boolean;
    variantMode?: string;
    aiMode?: string;
    aiCacheTtlMs?: number;
    aiPoolSize?: number;
  }) =>
    trackedInvoke<any>("cmd_mock_update_endpoint", {
      id: params.id,
      method: params.method,
      path: params.path,
      statusCode: params.statusCode,
      responseHeaders: params.responseHeaders,
      responseBody: params.responseBody,
      responseType: params.responseType,
      aiPrompt: params.aiPrompt ?? null,
      aiSchema: params.aiSchema ?? null,
      aiCount: params.aiCount ?? null,
      delayMs: params.delayMs ?? null,
      description: params.description ?? null,
      isActive: params.isActive ?? null,
      variantMode: params.variantMode ?? null,
      aiMode: params.aiMode ?? null,
      aiCacheTtlMs: params.aiCacheTtlMs ?? null,
      aiPoolSize: params.aiPoolSize ?? null,
    }),
  mockDeleteEndpoint: (id: string) =>
    trackedInvoke<any>("cmd_mock_delete_endpoint", { id }),
  mockDuplicateEndpoint: (id: string) =>
    trackedInvoke<any>("cmd_mock_duplicate_endpoint", { id }),

  // Response Variants
  mockLoadVariants: (endpointId: string) =>
    trackedInvoke<any>("cmd_mock_load_variants", { endpointId }),
  mockCreateVariant: (params: {
    endpointId: string;
    name?: string;
    statusCode?: number;
    responseHeaders?: string;
    responseBody?: string;
    matchRules?: string;
    weight?: number;
    orderIndex?: number;
    isActive?: boolean;
  }) =>
    trackedInvoke<any>("cmd_mock_create_variant", {
      endpointId: params.endpointId,
      name: params.name ?? null,
      statusCode: params.statusCode ?? null,
      responseHeaders: params.responseHeaders ?? null,
      responseBody: params.responseBody ?? null,
      matchRules: params.matchRules ?? null,
      weight: params.weight ?? null,
      orderIndex: params.orderIndex ?? null,
      isActive: params.isActive ?? null,
    }),
  mockUpdateVariant: (params: {
    id: string;
    name?: string;
    statusCode?: number;
    responseHeaders?: string;
    responseBody?: string;
    matchRules?: string;
    weight?: number;
    orderIndex?: number;
    isActive?: boolean;
  }) =>
    trackedInvoke<any>("cmd_mock_update_variant", {
      id: params.id,
      name: params.name ?? null,
      statusCode: params.statusCode ?? null,
      responseHeaders: params.responseHeaders ?? null,
      responseBody: params.responseBody ?? null,
      matchRules: params.matchRules ?? null,
      weight: params.weight ?? null,
      orderIndex: params.orderIndex ?? null,
      isActive: params.isActive ?? null,
    }),
  mockDeleteVariant: (id: string) =>
    trackedInvoke<any>("cmd_mock_delete_variant", { id }),

  // Server Lifecycle
  mockCheckPort: (port: number) =>
    trackedInvoke<{ available: boolean; error?: string }>(
      "cmd_mock_check_port",
      { port },
    ),
  mockSuggestPort: (preferred: number) =>
    trackedInvoke<any>("cmd_mock_suggest_port", { preferred }),
  mockStartServer: (serverId: string) =>
    trackedInvoke<any>("cmd_mock_start_server", { serverId }),
  mockStopServer: (serverId: string) =>
    trackedInvoke<any>("cmd_mock_stop_server", { serverId }),
  mockStopAllServers: () => trackedInvoke<any>("cmd_mock_stop_all_servers"),
  mockGetRunning: () => trackedInvoke<any>("cmd_mock_get_running"),
  mockLoadLogs: (params: {
    serverId: string;
    method?: string;
    status?: number;
    pathContains?: string;
    limit?: number;
  }) =>
    trackedInvoke<any>("cmd_mock_load_logs", {
      serverId: params.serverId,
      method: params.method ?? null,
      status: params.status ?? null,
      pathContains: params.pathContains ?? null,
      limit: params.limit ?? null,
    }),
  mockClearLogs: (serverId: string) =>
    trackedInvoke<any>("cmd_mock_clear_logs", { serverId }),
  mockExportLogs: (serverId: string) =>
    trackedInvoke<any>("cmd_mock_export_logs", { serverId }),

  // ── Daily Plan ─────────────────────────────────────────────
  dpSaveTask: (task: any) => trackedInvoke<any>("cmd_dp_save_task", { task }),
  dpLoadTasks: (startDate: string, endDate: string) =>
    trackedInvoke<any[]>("cmd_dp_load_tasks", { startDate, endDate }),
  dpRemoveTask: (id: string) =>
    trackedInvoke<any>("cmd_dp_remove_task", { id }),
  dpSaveReview: (review: any) =>
    trackedInvoke<any>("cmd_dp_save_review", { review }),
  dpLoadReviews: (startDate: string, endDate: string) =>
    trackedInvoke<any[]>("cmd_dp_load_reviews", { startDate, endDate }),
  dpRemoveReview: (id: string) =>
    trackedInvoke<any>("cmd_dp_remove_review", { id }),
  dpReorderTasks: (orderedIds: string[]) =>
    trackedInvoke<any>("cmd_dp_reorder_tasks", { orderedIds }),
  dpBulkUpdateStatus: (ids: string[], status: string, completedAt?: string) =>
    trackedInvoke<any>("cmd_dp_bulk_update_status", {
      ids,
      status,
      completedAt,
    }),
  dpSaveMeeting: (meeting: any) =>
    trackedInvoke<any>("cmd_dp_save_meeting", { meeting }),
  dpLoadMeetings: (startDate: string, endDate: string) =>
    trackedInvoke<any[]>("cmd_dp_load_meetings", { startDate, endDate }),
  dpRemoveMeeting: (id: string) =>
    trackedInvoke<any>("cmd_dp_remove_meeting", { id }),
  dpSaveDailyEntry: (entry: any) =>
    trackedInvoke<any>("cmd_dp_save_daily_entry", { entry }),
  dpLoadDailyEntry: (date: string) =>
    trackedInvoke<any>("cmd_dp_load_daily_entry", { date }),
  dpLoadDailyEntriesRange: (startDate: string, endDate: string) =>
    trackedInvoke<any[]>("cmd_dp_load_daily_entries_range", {
      startDate,
      endDate,
    }),
  dpSaveDailyStatus: (status: any) =>
    trackedInvoke<any>("cmd_dp_save_daily_status", { status }),
  dpLoadDailyStatus: (date: string) =>
    trackedInvoke<any>("cmd_dp_load_daily_status", { date }),
  dpSaveCategory: (category: any) =>
    trackedInvoke<any>("cmd_dp_save_category", { category }),
  dpLoadCategories: () => trackedInvoke<any[]>("cmd_dp_load_categories"),
  dpRemoveCategory: (id: string) =>
    trackedInvoke<any>("cmd_dp_remove_category", { id }),
  dpSaveTemplate: (template: any) =>
    trackedInvoke<any>("cmd_dp_save_template", { template }),
  dpLoadTemplates: () => trackedInvoke<any[]>("cmd_dp_load_templates"),
  dpRemoveTemplate: (id: string) =>
    trackedInvoke<any>("cmd_dp_remove_template", { id }),
  dpSearchTasks: (query: string) =>
    trackedInvoke<any[]>("cmd_dp_search_tasks", { query }),
  dpSearchMeetings: (query: string) =>
    trackedInvoke<any[]>("cmd_dp_search_meetings", { query }),

  // DailyPlan AI
  sendDailyPlanAICompletion: (params: {
    streamId: string;
    messages: any[];
    tools: any[];
    model?: string;
  }) =>
    trackedInvoke("cmd_dailyplan_ai_completion", {
      streamId: params.streamId,
      messages: params.messages,
      tools: params.tools,
      model: params.model ?? null,
    }),
  onDailyPlanAIChunk: (callback: (data: any) => void) => {
    const unlisten = listen("dailyplan-ai-chunk", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onDailyPlanAIDone: (callback: (data: any) => void) => {
    const unlisten = listen("dailyplan-ai-done", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onDailyPlanAIError: (callback: (data: any) => void) => {
    const unlisten = listen("dailyplan-ai-error", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onDailyPlanAIReasoningChunk: (callback: (data: any) => void) => {
    const unlisten = listen("dailyplan-ai-reasoning-chunk", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },

  // Code AI
  sendCodeAICompletion: (params: {
    streamId: string;
    messages: any[];
    tools: any[];
    model?: string;
  }) =>
    trackedInvoke("cmd_code_ai_completion", {
      streamId: params.streamId,
      messages: params.messages,
      tools: params.tools,
      model: params.model ?? null,
    }),
  onCodeAIChunk: (callback: (data: any) => void) => {
    const unlisten = listen("code-ai-chunk", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onCodeAIDone: (callback: (data: any) => void) => {
    const unlisten = listen("code-ai-done", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onCodeAIError: (callback: (data: any) => void) => {
    const unlisten = listen("code-ai-error", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onCodeAIReasoningChunk: (callback: (data: any) => void) => {
    const unlisten = listen("code-ai-reasoning-chunk", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },

  // ── Whisper Voice Input ─────────────────────────────────────
  whisperTranscribeChunk: (params: {
    streamId: string;
    audioData: number[];
    language: string | null;
    modelName?: string | null;
  }) =>
    trackedInvoke("cmd_whisper_transcribe_chunk", {
      streamId: params.streamId,
      audioData: params.audioData,
      language: params.language,
      modelName: params.modelName ?? null,
    }),
  whisperCancel: (streamId: string) =>
    trackedInvoke("cmd_whisper_cancel", { streamId }),
  whisperDownloadModel: (modelName: string) =>
    trackedInvoke<any>("cmd_whisper_download_model", { modelName }),
  whisperListModels: () => trackedInvoke<any>("cmd_whisper_list_models"),
  whisperDeleteModel: (modelName: string) =>
    trackedInvoke<any>("cmd_whisper_delete_model", { modelName }),
  onWhisperChunk: (callback: (data: any) => void) => {
    const unlisten = listen("whisper-chunk", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onWhisperError: (callback: (data: any) => void) => {
    const unlisten = listen("whisper-error", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onWhisperModelDownloadProgress: (callback: (data: any) => void) => {
    const unlisten = listen("whisper-model-download-progress", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onExplorerCopyProgress: (callback: (data: ExplorerCopyProgress) => void) => {
    const unlisten = listen("explorer-copy-progress", (event) =>
      callback(event.payload as ExplorerCopyProgress),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onWhisperModelDownloadDone: (callback: (data: any) => void) => {
    const unlisten = listen("whisper-model-download-done", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },

  // ── TTS Text-to-Speech ──────────────────────────────────────
  ttsSynthesize: (params: {
    streamId: string;
    text: string;
    voice?: string | null;
    speed?: number | null;
    variant?: string | null;
  }) =>
    trackedInvoke("cmd_tts_synthesize", {
      streamId: params.streamId,
      text: params.text,
      voice: params.voice ?? null,
      speed: params.speed ?? null,
      variant: params.variant ?? null,
    }),
  ttsCancel: (streamId: string) =>
    trackedInvoke("cmd_tts_cancel", { streamId }),
  ttsDownloadModel: (variant: string) =>
    trackedInvoke<any>("cmd_tts_download_model", { variant }),
  ttsListModels: () => trackedInvoke<any>("cmd_tts_list_models"),
  ttsDeleteModel: (variant: string) =>
    trackedInvoke<any>("cmd_tts_delete_model", { variant }),
  ttsListVoices: () => trackedInvoke<any>("cmd_tts_list_voices"),
  onTtsAudioChunk: (callback: (data: any) => void) => {
    const unlisten = listen("tts-audio-chunk", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onTtsError: (callback: (data: any) => void) => {
    const unlisten = listen("tts-error", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onTtsModelDownloadProgress: (callback: (data: any) => void) => {
    const unlisten = listen("tts-model-download-progress", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onTtsModelDownloadDone: (callback: (data: any) => void) => {
    const unlisten = listen("tts-model-download-done", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },

  // ── MCP Servers ────────────────────────────────────────
  mcpListServers: () => trackedInvoke<any[]>("cmd_mcp_list_servers"),
  mcpAddServer: (configJson: any) =>
    trackedInvoke<any[]>("cmd_mcp_add_server", { configJson }),
  mcpRemoveServer: (name: string) =>
    trackedInvoke<any[]>("cmd_mcp_remove_server", { name }),
  mcpConnectServer: (name: string) =>
    trackedInvoke<any[]>("cmd_mcp_connect_server", { name }),
  mcpDisconnectServer: (name: string) =>
    trackedInvoke<any[]>("cmd_mcp_disconnect_server", { name }),
  mcpListTools: () =>
    trackedInvoke<{ tools: any[]; count: number }>("cmd_mcp_list_tools"),
  mcpCallTool: (server: string, tool: string, args: Record<string, unknown>) =>
    trackedInvoke<string>("cmd_mcp_call_tool", { server, tool, args }),
  mcpConnectAll: () => trackedInvoke<string>("cmd_mcp_connect_all"),
  mcpGetPresets: () => trackedInvoke<any[]>("cmd_mcp_get_presets"),
  mcpImportVscode: () => trackedInvoke<any[]>("cmd_mcp_import_vscode"),
  mcpSyncVscode: () =>
    trackedInvoke<{
      added: string[];
      skipped: string[];
      connected: number;
      failed: number;
    }>("cmd_mcp_sync_vscode"),
  onMcpStatusChanged: (callback: (data: any[]) => void) => {
    const unlisten = listen("mcp-status-changed", (event) =>
      callback(event.payload as any[]),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },

  // Clipboard Manager
  loadClipboardItems: (params: {
    cursor?: string;
    limit?: number;
    contentType?: string;
    search?: string;
    fuzzy?: boolean;
    offset?: number;
  }) =>
    trackedInvoke<{ items: any[]; hasMore: boolean }>(
      "cmd_load_clipboard_items",
      params,
    ),
  removeClipboardItem: (id: string) =>
    trackedInvoke<{ success: boolean }>("cmd_remove_clipboard_item", { id }),
  updateClipboardText: (id: string, textContent: string) =>
    trackedInvoke<{ success: boolean }>("cmd_update_clipboard_text", {
      id,
      textContent,
    }),
  updateClipboardImageDescription: (id: string, description: string) =>
    trackedInvoke<{ success: boolean }>(
      "cmd_update_clipboard_image_description",
      { id, description },
    ),
  toggleClipboardPin: (id: string) =>
    trackedInvoke<{ success: boolean; isPinned: boolean }>(
      "cmd_toggle_clipboard_pin",
      { id },
    ),
  clearClipboardItems: (includePinned: boolean = false) =>
    trackedInvoke<{ success: boolean }>("cmd_clear_clipboard_items", {
      includePinned,
    }),
  copyClipboardItem: (id: string) =>
    trackedInvoke<{ success: boolean }>("cmd_copy_clipboard_item", { id }),
  getClipboardImage: (imagePath: string) =>
    trackedInvoke<{ success: boolean; dataUrl?: string; error?: string }>(
      "cmd_get_clipboard_image",
      { imagePath },
    ),
  revealClipboardImage: (imagePath: string) =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_reveal_clipboard_image",
      { imagePath },
    ),
  clipboardStats: () =>
    trackedInvoke<{
      total: number;
      textCount: number;
      imageCount: number;
      labeledCount: number;
      pinnedCount: number;
    }>("cmd_clipboard_stats"),
  setClipboardMaxItems: (maxItems: number) =>
    trackedInvoke<{ success: boolean; maxItems: number; pruned: number }>(
      "cmd_set_clipboard_max_items",
      { maxItems },
    ),
  setClipboardAddOnce: (enabled: boolean) =>
    trackedInvoke<{ success: boolean; addOnce: boolean }>(
      "cmd_set_clipboard_add_once",
      { enabled },
    ),
  setClipboardEnabled: (enabled: boolean) =>
    trackedInvoke<{ success: boolean; enabled: boolean }>(
      "cmd_set_clipboard_enabled",
      { enabled },
    ),
  // Clipboard Labels
  loadClipboardLabels: () =>
    trackedInvoke<{ labels: any[] }>("cmd_load_clipboard_labels"),
  createClipboardLabel: (id: string, name: string, color: string) =>
    trackedInvoke<{ success: boolean }>("cmd_create_clipboard_label", {
      id,
      name,
      color,
    }),
  updateClipboardLabel: (id: string, name: string, color: string) =>
    trackedInvoke<{ success: boolean }>("cmd_update_clipboard_label", {
      id,
      name,
      color,
    }),
  deleteClipboardLabel: (id: string) =>
    trackedInvoke<{ success: boolean; affectedCount: number }>(
      "cmd_delete_clipboard_label",
      { id },
    ),
  addLabelToClipboardItem: (itemId: string, labelId: string) =>
    trackedInvoke<{ success: boolean }>("cmd_add_label_to_clipboard_item", {
      itemId,
      labelId,
    }),
  removeLabelFromClipboardItem: (itemId: string, labelId: string) =>
    trackedInvoke<{ success: boolean }>(
      "cmd_remove_label_from_clipboard_item",
      { itemId, labelId },
    ),
  loadLabelsForClipboardItem: (itemId: string) =>
    trackedInvoke<{ labels: any[] }>("cmd_load_labels_for_clipboard_item", {
      itemId,
    }),
  onClipboardNewItem: (callback: (item: any) => void) => {
    const unlisten = listen("clipboard-new-item", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onClipboardImageAnalyzed: (callback: (data: any) => void) => {
    const unlisten = listen("clipboard-image-analyzed", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onClipboardItemMoved: (callback: (item: any) => void) => {
    const unlisten = listen("clipboard-item-moved", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  analyzeClipboardImage: (itemId: string, imagePath: string, model?: string) =>
    trackedInvoke<{ success: boolean }>("cmd_analyze_clipboard_image", {
      itemId,
      imagePath,
      model: model ?? null,
    }),
  loadClipboardItemsByDate: (date: string) =>
    trackedInvoke<{ items: any[] }>("cmd_load_clipboard_items_by_date", {
      date,
    }),

  // Timer
  saveTimerSession: (session: any) =>
    trackedInvoke<{ success: boolean; id?: string; error?: string }>(
      "cmd_save_timer_session",
      { session },
    ),
  loadTimerSessions: (filter?: any, pagination?: any) =>
    trackedInvoke<{ items: any[]; hasMore: boolean }>(
      "cmd_load_timer_sessions",
      { filter, pagination },
    ),
  removeTimerSession: (id: string) =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_remove_timer_session",
      { id },
    ),
  saveTimerTag: (tag: any) =>
    trackedInvoke<{ success: boolean; id?: string; error?: string }>(
      "cmd_save_timer_tag",
      { tag },
    ),
  loadTimerTags: () => trackedInvoke<{ items: any[] }>("cmd_load_timer_tags"),
  removeTimerTag: (id: string) =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_remove_timer_tag",
      { id },
    ),
  saveTimerGoal: (goal: any) =>
    trackedInvoke<{ success: boolean; id?: string; error?: string }>(
      "cmd_save_timer_goal",
      { goal },
    ),
  loadTimerGoals: () => trackedInvoke<{ items: any[] }>("cmd_load_timer_goals"),
  saveTimerMilestone: (key: string) =>
    trackedInvoke<{ success: boolean; id?: string; error?: string }>(
      "cmd_save_timer_milestone",
      { key },
    ),
  loadTimerMilestones: () =>
    trackedInvoke<{ items: any[] }>("cmd_load_timer_milestones"),
  getTimerStats: (range?: any) =>
    trackedInvoke<any>("cmd_get_timer_stats", { range }),
  setTimerTrayTitle: (text: string) =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_set_timer_tray_title",
      { text },
    ),
  setTimerTrayVisible: (visible: boolean) =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_set_timer_tray_visible",
      { visible },
    ),
  openTimerFocusWindow: () =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_open_timer_focus_window",
    ),
  closeTimerFocusWindow: () =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_close_timer_focus_window",
    ),

  // Usage tracking
  saveUsageSession: (session: any) =>
    trackedInvoke<{ success: boolean; id?: string; error?: string }>(
      "cmd_save_usage_session",
      { session },
    ),
  getUsageStats: (range?: any) =>
    trackedInvoke<any>("cmd_get_usage_stats", { range }),
  clearUsageData: () =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_clear_usage_data",
    ),

  // ── Integrated terminal (PTY) ────────────────────────────────────────────
  terminalCreate: (params?: {
    cwd?: string;
    shell?: string;
    args?: string[];
    cols?: number;
    rows?: number;
    env?: Record<string, string>;
  }) =>
    trackedInvoke<{
      success: boolean;
      data?: { id: string; shell: string; cwd: string | null };
      error?: string;
    }>("cmd_terminal_create", { params: params ?? null }),
  terminalWrite: (id: string, dataBase64: string) =>
    trackedInvoke<{ success: boolean; error?: string }>("cmd_terminal_write", {
      id,
      data: dataBase64,
    }),
  terminalResize: (id: string, cols: number, rows: number) =>
    trackedInvoke<{ success: boolean; error?: string }>("cmd_terminal_resize", {
      id,
      cols,
      rows,
    }),
  terminalKill: (id: string) =>
    trackedInvoke<{ success: boolean; error?: string }>("cmd_terminal_kill", {
      id,
    }),
  terminalList: () =>
    trackedInvoke<{
      success: boolean;
      data?: Array<{ id: string; shell: string; cwd: string | null }>;
      error?: string;
    }>("cmd_terminal_list"),
  terminalDefaultShell: () =>
    trackedInvoke<{
      success: boolean;
      data?: { shell: string; args: string[] };
      error?: string;
    }>("cmd_terminal_default_shell"),
  terminalCwd: (id: string) =>
    trackedInvoke<{
      success: boolean;
      data?: { cwd: string | null };
      error?: string;
    }>("cmd_terminal_cwd", { id }),
  terminalHistoryRead: (shell?: string | null) =>
    trackedInvoke<{
      success: boolean;
      data?: Array<{ command: string; count: number }>;
      error?: string;
    }>("cmd_terminal_history_read", { shell: shell ?? null }),
  terminalListDir: (cwd: string, dir: string) =>
    trackedInvoke<{
      success: boolean;
      data?: Array<{ name: string; isDir: boolean }>;
      error?: string;
    }>("cmd_terminal_list_dir", { cwd, dir }),
  terminalSessionSave: (key: string, data: string) =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_terminal_session_save",
      { key, data },
    ),
  terminalSessionLoad: (key: string) =>
    trackedInvoke<{ success: boolean; data?: string | null; error?: string }>(
      "cmd_terminal_session_load",
      { key },
    ),
  terminalSessionDelete: (key: string) =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_terminal_session_delete",
      { key },
    ),
  terminalSessionPrune: (keep: string[]) =>
    trackedInvoke<{ success: boolean; removed?: number; error?: string }>(
      "cmd_terminal_session_prune",
      { keep },
    ),
  onTerminalOutput: (
    callback: (payload: { id: string; data: string }) => void,
  ) => {
    const unlisten = listen("terminal-output", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onTerminalExit: (
    callback: (payload: { id: string; code: number | null }) => void,
  ) => {
    const unlisten = listen("terminal-exit", (event) =>
      callback(event.payload as any),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },

  // ── Remote terminal (LAN browser access via QR) ──────────────────────────
  remoteTerminalStart: (port?: number) =>
    trackedInvoke<{
      success: boolean;
      data?: { url: string; ip: string; port: number; token: string };
      error?: string;
    }>("cmd_remote_terminal_start", { port: port ?? null }),
  remoteTerminalStop: () =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_remote_terminal_stop",
    ),
  remoteTerminalStatus: () =>
    trackedInvoke<{
      success: boolean;
      data?: {
        running: boolean;
        url: string | null;
        ip: string | null;
        port: number | null;
        token: string | null;
        clients: Array<{
          clientId: string;
          ip: string;
          connectedAt: number;
        }>;
        permissions: { allowNewTab: boolean; allowCloseTab: boolean };
      };
      error?: string;
    }>("cmd_remote_terminal_status"),
  remoteTerminalApprove: (requestId: string) =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_remote_terminal_approve",
      { requestId },
    ),
  remoteTerminalDeny: (requestId: string) =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_remote_terminal_deny",
      { requestId },
    ),
  remoteTerminalDisconnect: (clientId: string) =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_remote_terminal_disconnect",
      { clientId },
    ),
  remoteTerminalSetTabs: (tabs: Array<{ id: string; title: string }>) =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_remote_terminal_set_tabs",
      { tabs },
    ),
  remoteTerminalSetPermissions: (permissions: {
    allowNewTab: boolean;
    allowCloseTab: boolean;
  }) =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_remote_terminal_set_permissions",
      { permissions },
    ),
  remoteTerminalAttachNew: (requestId: string, sessionId: string) =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_remote_terminal_attach_new",
      { requestId, sessionId },
    ),
  onRemoteApprovalRequest: (
    callback: (payload: {
      requestId: string;
      ip: string;
    }) => void,
  ) => {
    const unlisten = listen<{ requestId: string; ip: string }>(
      "remote-terminal-approval-request",
      (event) => callback(event.payload),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onRemoteClientsChanged: (
    callback: (payload: {
      clients: Array<{
        clientId: string;
        ip: string;
        connectedAt: number;
      }>;
    }) => void,
  ) => {
    const unlisten = listen<{
      clients: Array<{ clientId: string; ip: string; connectedAt: number }>;
    }>("remote-terminal-clients-changed", (event) => callback(event.payload));
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onRemoteCloseTab: (callback: (payload: { sessionId: string }) => void) => {
    const unlisten = listen<{ sessionId: string }>(
      "remote-terminal-close-tab",
      (event) => callback(event.payload),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onRemoteNewTab: (
    callback: (payload: {
      requestId: string;
      cols: number;
      rows: number;
    }) => void,
  ) => {
    const unlisten = listen<{ requestId: string; cols: number; rows: number }>(
      "remote-terminal-new-tab",
      (event) => callback(event.payload),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onRemoteMirrorSize: (
    callback: (payload: {
      sessionId: string;
      cols: number;
      rows: number;
      controlled: boolean;
    }) => void,
  ) => {
    const unlisten = listen<{
      sessionId: string;
      cols: number;
      rows: number;
      controlled: boolean;
    }>("remote-terminal-mirror-size", (event) => callback(event.payload));
    return () => {
      unlisten.then((fn) => fn());
    };
  },

  // ── Monitor (LAN camera + mic streaming via QR) ────────────────────────
  monitorStart: (port?: number) =>
    trackedInvoke<{
      success: boolean;
      data?: { url: string; ip: string; port: number; token: string };
      error?: string;
    }>("cmd_monitor_start", { port: port ?? null }),
  monitorStop: () =>
    trackedInvoke<{ success: boolean; error?: string }>("cmd_monitor_stop"),
  monitorStatus: () =>
    trackedInvoke<{
      success: boolean;
      data?: {
        running: boolean;
        url: string | null;
        ip: string | null;
        port: number | null;
        token: string | null;
        clients: Array<{ clientId: string; ip: string; connectedAt: number }>;
      };
      error?: string;
    }>("cmd_monitor_status"),
  monitorApprove: (requestId: string) =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_monitor_approve",
      { requestId },
    ),
  monitorDeny: (requestId: string) =>
    trackedInvoke<{ success: boolean; error?: string }>("cmd_monitor_deny", {
      requestId,
    }),
  monitorDisconnect: (clientId: string) =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_monitor_disconnect",
      { clientId },
    ),
  monitorSendSignal: (clientId: string, data: unknown) =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_monitor_send_signal",
      { clientId, data },
    ),
  onMonitorApprovalRequest: (
    callback: (payload: { requestId: string; ip: string }) => void,
  ) => {
    const unlisten = listen<{ requestId: string; ip: string }>(
      "monitor-approval-request",
      (event) => callback(event.payload),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onMonitorClientsChanged: (
    callback: (payload: {
      clients: Array<{ clientId: string; ip: string; connectedAt: number }>;
    }) => void,
  ) => {
    const unlisten = listen<{
      clients: Array<{ clientId: string; ip: string; connectedAt: number }>;
    }>("monitor-clients-changed", (event) => callback(event.payload));
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onMonitorClientConnected: (
    callback: (payload: { clientId: string; ip: string }) => void,
  ) => {
    const unlisten = listen<{ clientId: string; ip: string }>(
      "monitor-client-connected",
      (event) => callback(event.payload),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onMonitorClientDisconnected: (
    callback: (payload: { clientId: string }) => void,
  ) => {
    const unlisten = listen<{ clientId: string }>(
      "monitor-client-disconnected",
      (event) => callback(event.payload),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onMonitorSignal: (
    callback: (payload: { clientId: string; data: unknown }) => void,
  ) => {
    const unlisten = listen<{ clientId: string; data: unknown }>(
      "monitor-signal",
      (event) => callback(event.payload),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },

  // ── QuickShare (LAN file/text drop hub via QR) ───────────────────────────
  quickShareStart: (port?: number) =>
    trackedInvoke<{
      success: boolean;
      data?: {
        url: string;
        ip: string;
        port: number;
        token: string;
        storageDir: string;
      };
      error?: string;
    }>("cmd_quickshare_start", { port: port ?? null }),
  quickShareStop: () =>
    trackedInvoke<{ success: boolean; error?: string }>("cmd_quickshare_stop"),
  quickShareStatus: () =>
    trackedInvoke<{
      success: boolean;
      data?: {
        running: boolean;
        url: string | null;
        ip: string | null;
        port: number | null;
        token: string | null;
        storageDir: string | null;
        clients: Array<{
          clientId: string;
          deviceId: string;
          name: string;
          ip: string;
          connectedAt: number;
        }>;
        items: Array<{
          id: string;
          kind: "file" | "text";
          name: string;
          size: number;
          mime: string;
          senderLabel: string;
          senderId: string;
          target: string;
          createdAt: number;
          text?: string;
        }>;
      };
      error?: string;
    }>("cmd_quickshare_status"),
  quickShareAddFiles: (paths: string[], target?: string) =>
    trackedInvoke<{
      success: boolean;
      data?: { added: number };
      error?: string;
    }>("cmd_quickshare_add_files", { paths, target }),
  quickShareAddText: (text: string, target?: string) =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_quickshare_add_text",
      { text, target },
    ),
  quickShareRemoveItem: (itemId: string) =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_quickshare_remove_item",
      { itemId },
    ),
  quickShareRemoveAll: () =>
    trackedInvoke<{
      success: boolean;
      data?: { removed: number };
      error?: string;
    }>("cmd_quickshare_remove_all"),
  quickShareRevealItem: (itemId: string) =>
    trackedInvoke<{ success: boolean; error?: string }>(
      "cmd_quickshare_reveal_item",
      { itemId },
    ),
  quickShareDownloadAll: () =>
    trackedInvoke<{
      success: boolean;
      data?: { copied: number; alreadySaved: number; dir: string };
      error?: string;
    }>("cmd_quickshare_download_all"),
  quickShareZipAndSend: (target?: string) =>
    trackedInvoke<{
      success: boolean;
      data?: { name: string; size: number; files: number; target: string };
      error?: string;
    }>("cmd_quickshare_zip_and_send", { target }),
  onQuickShareTrayChanged: (
    callback: (payload: {
      items: Array<{
        id: string;
        kind: "file" | "text";
        name: string;
        size: number;
        mime: string;
        senderLabel: string;
        senderId: string;
        target: string;
        createdAt: number;
        text?: string;
      }>;
    }) => void,
  ) => {
    const unlisten = listen<{
      items: Array<{
        id: string;
        kind: "file" | "text";
        name: string;
        size: number;
        mime: string;
        senderLabel: string;
        senderId: string;
        target: string;
        createdAt: number;
        text?: string;
      }>;
    }>("quickshare-tray-changed", (event) => callback(event.payload));
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onQuickShareClientsChanged: (
    callback: (payload: {
      clients: Array<{
        clientId: string;
        deviceId: string;
        name: string;
        ip: string;
        connectedAt: number;
      }>;
    }) => void,
  ) => {
    const unlisten = listen<{
      clients: Array<{
        clientId: string;
        deviceId: string;
        name: string;
        ip: string;
        connectedAt: number;
      }>;
    }>("quickshare-clients-changed", (event) => callback(event.payload));
    return () => {
      unlisten.then((fn) => fn());
    };
  },

  // ── Content Share (share books + notes between Genisys devices on the LAN) ──
  // Approval-gated device-to-device transfer over mDNS + HTTP. Received books /
  // notes are imported as fresh copies (new ids) so they persist locally.
  contentShareStart: () =>
    trackedInvoke<{
      success: boolean;
      data?: ContentShareStatus;
      error?: string;
    }>("cmd_content_share_start"),
  contentShareStop: () =>
    trackedInvoke<{ success: boolean; error?: string }>("cmd_content_share_stop"),
  contentShareStatus: () =>
    trackedInvoke<{
      success: boolean;
      data?: ContentShareStatus;
      error?: string;
    }>("cmd_content_share_status"),
  contentShareListDevices: () =>
    trackedInvoke<{
      success: boolean;
      data?: ContentSharePeer[];
      error?: string;
    }>("cmd_content_share_list_devices"),
  contentShareSetDeviceName: (name: string) =>
    trackedInvoke<{ success: boolean; data?: string; error?: string }>(
      "cmd_content_share_set_device_name",
      { name },
    ),
  contentShareRespond: (transferId: string, accept: boolean) =>
    trackedInvoke<{ success: boolean }>("cmd_content_share_respond", {
      transferId,
      accept,
    }),
  contentShareSendBook: (deviceId: string, bookId: string) =>
    trackedInvoke<{ success: boolean; accepted?: boolean; error?: string }>(
      "cmd_content_share_send_book",
      { deviceId, bookId },
    ),
  contentShareSendNotes: (deviceId: string, kind: string, id?: string) =>
    trackedInvoke<{ success: boolean; accepted?: boolean; error?: string }>(
      "cmd_content_share_send_notes",
      { deviceId, kind, id: id ?? null },
    ),
  onContentShareDevicesChanged: (callback: () => void) => {
    const unlisten = listen("content-share-devices-changed", () => callback());
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onContentShareIncoming: (
    callback: (payload: ContentShareIncoming) => void,
  ) => {
    const unlisten = listen<ContentShareIncoming>(
      "content-share-incoming",
      (event) => callback(event.payload),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onContentShareReceived: (
    callback: (payload: ContentShareReceived) => void,
  ) => {
    const unlisten = listen<ContentShareReceived>(
      "content-share-received",
      (event) => callback(event.payload),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onContentShareSendProgress: (
    callback: (payload: ContentShareSendProgress) => void,
  ) => {
    const unlisten = listen<ContentShareSendProgress>(
      "content-share-send-progress",
      (event) => callback(event.payload),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },

  // ── Messages (P2P end-to-end-encrypted local messaging) ─────────────
  // All payloads use camelCase. Conversation content is NEVER persisted —
  // only the local identity + peer trust store survive restarts. See
  // src/components/Messages/Messages.types.ts for the payload shapes.
  msgStart: () => trackedInvoke<MsgIdentity>("cmd_msg_start"),
  msgGetIdentity: () => trackedInvoke<MsgIdentity>("cmd_msg_get_identity"),
  msgSetDisplayName: (name: string) =>
    trackedInvoke<MsgIdentity>("cmd_msg_set_display_name", { name }),
  msgSetOffline: (offline: boolean) =>
    trackedInvoke<MsgIdentity>("cmd_msg_set_offline", { offline }),
  msgGetPeers: () => trackedInvoke<MsgPeer[]>("cmd_msg_get_peers"),
  msgConnect: (args: { peerId?: string; host?: string; port?: number }) =>
    trackedInvoke<MsgPeer>("cmd_msg_connect", {
      peerId: args.peerId ?? null,
      host: args.host ?? null,
      port: args.port ?? null,
    }),
  msgDisconnect: (peerId: string) =>
    trackedInvoke<void>("cmd_msg_disconnect", { peerId }),
  msgSendText: (peerId: string, text: string) =>
    trackedInvoke<MsgEnvelope>("cmd_msg_send_text", { peerId, text }),
  msgSendImage: (args: {
    peerId: string;
    dataBase64: string;
    mimeType: string;
    fileName?: string;
  }) =>
    trackedInvoke<MsgEnvelope>("cmd_msg_send_image", {
      peerId: args.peerId,
      dataBase64: args.dataBase64,
      mimeType: args.mimeType,
      fileName: args.fileName ?? null,
    }),
  msgVerifyPeer: (peerId: string) =>
    trackedInvoke<MsgPeer>("cmd_msg_verify_peer", { peerId }),
  msgSetTyping: (peerId: string, isTyping: boolean) =>
    trackedInvoke<void>("cmd_msg_set_typing", { peerId, isTyping }),
  msgSendSignal: (peerId: string, payload: string) =>
    trackedInvoke<void>("cmd_msg_send_signal", { peerId, payload }),
  msgSendControl: (peerId: string, payload: string) =>
    trackedInvoke<void>("cmd_msg_send_control", { peerId, payload }),
  msgRotateIdentity: () =>
    trackedInvoke<MsgIdentity>("cmd_msg_rotate_identity"),
  msgRescan: () => trackedInvoke<MsgIdentity>("cmd_msg_rescan"),
  msgAcceptRequest: (peerId: string) =>
    trackedInvoke<void>("cmd_msg_accept_request", { peerId }),
  msgRejectRequest: (peerId: string) =>
    trackedInvoke<void>("cmd_msg_reject_request", { peerId }),
  onMsgPeerDiscovered: (callback: (data: MsgPeer) => void) => {
    const unlisten = listen("msg-peer-discovered", (event) =>
      callback(event.payload as MsgPeer),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onMsgPeerLost: (callback: (data: { peerId: string }) => void) => {
    const unlisten = listen("msg-peer-lost", (event) =>
      callback(event.payload as { peerId: string }),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onMsgPeerUpdated: (callback: (data: MsgPeer) => void) => {
    const unlisten = listen("msg-peer-updated", (event) =>
      callback(event.payload as MsgPeer),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onMsgMessage: (callback: (data: MsgEnvelope) => void) => {
    const unlisten = listen("msg-message", (event) =>
      callback(event.payload as MsgEnvelope),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onMsgTyping: (
    callback: (data: { peerId: string; isTyping: boolean }) => void,
  ) => {
    const unlisten = listen("msg-typing", (event) =>
      callback(event.payload as { peerId: string; isTyping: boolean }),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onMsgError: (
    callback: (data: { peerId: string | null; error: string }) => void,
  ) => {
    const unlisten = listen("msg-error", (event) =>
      callback(event.payload as { peerId: string | null; error: string }),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onMsgSignal: (
    callback: (data: { peerId: string; payload: string }) => void,
  ) => {
    const unlisten = listen("msg-signal", (event) =>
      callback(event.payload as { peerId: string; payload: string }),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onMsgControl: (
    callback: (data: { peerId: string; payload: string }) => void,
  ) => {
    const unlisten = listen("msg-control", (event) =>
      callback(event.payload as { peerId: string; payload: string }),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onMsgRequest: (callback: (data: MsgRequest) => void) => {
    const unlisten = listen("msg-request", (event) =>
      callback(event.payload as MsgRequest),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },
  onMsgRequestResolved: (callback: (data: { peerId: string }) => void) => {
    const unlisten = listen("msg-request-resolved", (event) =>
      callback(event.payload as { peerId: string }),
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  },

  // ── Native media permissions (macOS camera/microphone TCC pre-flight) ──
  // Drives the AVFoundation authorization request from the Genisys process so the
  // OS prompt fires and the app registers in System Settings → Privacy. On
  // non-macOS these resolve as "authorized"/true and are effectively no-ops.
  avAuthorizationStatus: (media: "audio" | "video") =>
    trackedInvoke<
      "notDetermined" | "restricted" | "denied" | "authorized" | "unknown"
    >("cmd_av_authorization_status", { media }),
  requestAvAccess: (media: "audio" | "video") =>
    trackedInvoke<boolean>("cmd_request_av_access", { media }),
  openPrivacySettings: (pane: "camera" | "microphone") =>
    trackedInvoke<void>("cmd_open_privacy_settings", { pane }),
};

;(window as any).api = api
;(window as any).electron = { process: { platform: 'darwin' } }

export default api
