# Genisys — Gen ai in system

A local-first desktop "operating system" for developers. Genisys bundles the day-to-day tools an engineer reaches for — file/repo exploration, an HTTP client, notes, prompts, daily planning, clipboard history, timers — into a single Tauri 2 + React 19 app, with AI assistance woven into every surface.

Everything runs on the user's machine: SQLite for structured data, a Rust backend for native integrations (Git, MCP, Whisper STT, PTY terminals, global shortcuts, mDNS peer discovery + Noise-encrypted LAN messaging), and bring-your-own-key AI providers (OpenAI, Anthropic, Google, or any OpenAI-compatible endpoint) for cloud calls.

---

## Table of Contents

- [Apps](#apps)
- [Cross-cutting Systems](#cross-cutting-systems)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Backend (Rust) Modules](#backend-rust-modules)
- [Database](#database)
- [State Management](#state-management)
- [Themes](#themes)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Windows & Multi-window](#windows--multi-window)
- [License](#license)

---

## Apps

Genisys is organized around a left-side `ActivityBar` that switches between top-level apps. Each app is lazy-loaded (see [src/App.constants.ts](src/App.constants.ts)) and registered in [src/components/ActivityBar/ActivityBar.items.ts](src/components/ActivityBar/ActivityBar.items.ts).

| App | Purpose |
|---|---|
| **Dashboard** | Project-centric hub aggregating snippets, news, live sports tiles, and project shortcuts. Resizable + drag-reorderable tiles. |
| **Daily Plan** | Day planner with tasks, calendar items, focus sessions, search, status panel, and AI suggestions. |
| **Notes** | Multi-notebook note system with sections, topics, labels, favorites, trash, fuzzy search, and Tiptap-based WYSIWYG editing. |
| **Prompts** | Prompt manager + library. Tabs, categories, folders, favorites, usage tracking, and per-prompt model targeting. |
| **Library** | Long-form reading + book generation. Imports webpages or generates books chapter-by-chapter, supports translations, bookmarks, highlights, quizzes, and resume-reading. |
| **WebLinks** | Save, organize, and open any link. Collections sidebar with nested folders, saved links with page previews, fuzzy search, and an AI Assistant right panel. |
| **WebPoint** | AI presentation builder. Generate or edit slide decks from natural-language prompts, with an in-app editor, element inspector, thumbnails, and a present mode. |
| **Explorer** | Local file-system + repo browser. Multi-pane splits, list/grid/detailed/thumbnail views, pins, hidden-file toggle, drag-and-drop, repo history, Git integration, and an AI submit flow. |
| **Chat** | Conversational AI assistant. Streaming responses, conversation history (paginated 50/page), snippet insertion, tool calls, per-message context modes, annotations, and a right panel with snippets + chat context. |
| **Messages** | Private peer-to-peer, end-to-end encrypted LAN messaging. mDNS peer discovery, Noise-encrypted transport, identity + fingerprint verification, connection requests, text + image, typing/presence indicators, reactions, disappearing (ephemeral) messages, and 1:1 calls. Conversation content is never persisted. |
| **QuickShare** | Cross-device file + text drop over your LAN. The desktop runs a hub; any device scans a QR to send/receive files and text, with WebRTC peer-to-peer transfer (HTTP cut-through fallback) and optional zip bundling. |
| **Monitor** | Turns this device into a remote camera + microphone. A phone or laptop on the same Wi-Fi scans a QR, gets approved, then watches and listens live over WebRTC. |
| **API Client** | Postman-style HTTP client. Collections, folders, requests, environments + variables, cookies, request body editor, response snapshots, and execution history. |
| **Mock Server** | Local mock-server manager for stubbing API responses during development. |
| **Terminal** | Multi-tab terminal with recursive split panes, drag-to-reorder/split, pinned + renamable tabs, prompt insertion, scrollback persistence across relaunch, and one-tap sharing to a phone over LAN. Built on xterm.js + a Rust PTY. |
| **Clipboard** | Persistent clipboard manager. Items with labels, fuzzy search, image OCR/description, by-date browsing, prune/clear, and a menubar popover. |
| **Timer** | Focus timer with goals, milestones, tags, sessions, stats, and a detachable always-on-top mini window. |
| **Autoflow** | Workflow automation canvas (in progress). Tool palette + node-based flow builder for chaining actions. |
| **App Store** | In-app catalog of bundled Genisys apps with a unified description / preview surface. |

### Standalone / inspector tools

These open as their own routes or detached windows (see [src/App.tsx](src/App.tsx)):

- **AI Inspector** — Inspect AI runs, tool calls, prompts, models, and streaming events.
- **Store Inspector** — Live view of every Zustand store for debugging.
- **Debug Panel** — Network / Tauri-IPC request inspector with filters and stats, plus a Bug Report tab. Also bootable as a standalone window via `?mode=debug`.
- **Settings** — Per-section configuration UI (User, Dashboard, Explorer, Chat, Layout, AI app modes, Danger zone).

---

## Cross-cutting Systems

Genisys leans on a handful of shared in-house frameworks (see [src/frameworks/](src/frameworks/)) that every app reuses.

### AI

- **Tools framework** — [src/ai/tools/](src/ai/tools/) defines per-app tool catalogs (api-client, clipboard, daily-plan, dashboard, library, memory, mock-server, notes, project-explorer, prompt-manager, weblinks). `describeToolActivity.ts` produces human-readable tool-activity summaries used across the UI.
- **Entity Links** — [src/ai/entity-links/](src/ai/entity-links/) registers handlers for entity tokens in AI output (files, prompts, …) so streamed text can render rich, clickable references via a single `entity://` href scheme.
- **AI Memory** — Long-lived per-app memory store ([src/store/ai-memory-store.ts](src/store/ai-memory-store.ts)) backed by SQLite, surfaced via the AI Inspector.
- **AI Assistant Panel** — Universal right-panel AI assistant ([src/right-panels/AIAssistantPanel/](src/right-panels/AIAssistantPanel/)) that mounts inside any app, scoped to that app's tools and context.

### Right-Panel framework

[src/frameworks/right-panel/](src/frameworks/right-panel/) provides a generic tabbed right panel: `PanelRegistry`, `PanelRenderer`, `PanelDataContext`, instance/active contexts, and an event bus. Each app contributes panels (e.g. AIAssistantPanel, Notes, SearchPanel, TimelinePanel, TocPanel, DailyStatusPanel).

### Keyboard shortcuts

[src/frameworks/keyboard-shortcut/](src/frameworks/keyboard-shortcut/) is a typed shortcut registry with a global `ShortcutDispatcher`, chord/combo parsing, conflict detection, and a Zustand-backed override store. Per-app shortcut implementations live in [src/keyboard-shortcut-impl/](src/keyboard-shortcut-impl/) (apiclient, chat, clipboard, clock, command-palette, dailyplan, library, mockserver, prompts, timer, toggle-right-panel, toggle-sidebar, window-actions, zoom-actions). Global OS-level shortcuts use `tauri-plugin-global-shortcut`.

### App-Switcher

[src/frameworks/app-switcher/](src/frameworks/app-switcher/) is the HUD-style switcher invoked via shortcut to jump between apps, sharing item metadata with the ActivityBar.

### WYSIWYG editor

[src/frameworks/wysiwyg-editor/](src/frameworks/wysiwyg-editor/) wraps Tiptap (StarterKit, table, task-list, mention, placeholder, highlight, link, image, underline, code-block-lowlight, markdown) for Notes, Daily Plan, Library, and prompt editing.

### Notifications

[src/frameworks/notification/](src/frameworks/notification/) wraps Sonner toasts + `tauri-plugin-notification` for in-app and native OS notifications.

### Command Palette

[src/components/CommandPalette/](src/components/CommandPalette/) is a global ⌘K palette with fuzzy search (Fuse.js), recents store, and registered actions across apps.

### Security Lock

[src/components/LockScreen/](src/components/LockScreen/) + `useSecurityLock` provide a lock screen on idle / quit-confirm flows. Quit confirmation lives in [src/components/QuitConfirmModal/](src/components/QuitConfirmModal/).

### Voice

- **Voice Input** — [src/components/VoiceInput/](src/components/VoiceInput/) uses the Rust `whisper-rs` backend for on-device speech-to-text.
- **Text-to-Speech** — [src/components/TextToSpeech/](src/components/TextToSpeech/) uses `sherpa-onnx` for offline TTS playback (used by Library, Chat, Notes).

### Usage & Analytics

- **Usage tracking** — [src/lib/usage/](src/lib/usage/) records per-app focus sessions, backed by the Rust `usage` commands (SQLite `app_usage_sessions`). Surfaced as charts in **Settings → Usage analytics**, with an opt-out toggle.
- **Telemetry** — [src/lib/analytics/](src/lib/analytics/) records anonymous usage analytics, gated behind explicit telemetry consent.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript 6, Vite 8, Tailwind CSS 4 |
| **UI primitives** | Radix UI, Lucide React, React Icons, Sonner |
| **Realtime / P2P** | `snow` (Noise Protocol E2EE messaging), `mdns-sd` (LAN peer discovery), WebRTC — 1:1 calls (Messages), camera/mic streaming (Monitor), data-channel transfer (QuickShare); Axum signaling/relay |
| **Editors** | Monaco Editor (DiffViewer), Tiptap 3 (Notes/Library/Prompts) |
| **Tables & lists** | TanStack Table, TanStack Virtual |
| **Drag & drop** | @dnd-kit/core + sortable + utilities |
| **Diagrams & graphs** | XYFlow (Autoflow), Mermaid, Sigma, Graphology + ForceAtlas2, Dagre |
| **Terminal** | xterm.js + addons (fit, web-links), backed by Rust `portable-pty` |
| **Markdown & docs** | react-markdown + remark-gfm + remark-math + rehype-katex, marked, Shiki, lowlight |
| **Charts** | Recharts |
| **Fuzzy search** | Fuse.js |
| **State** | Zustand 5 |
| **Worker bridge** | Comlink |
| **Fonts (catalog)** | IBM Plex Sans, Inter, Geist, Geist Mono, JetBrains Mono, Cascadia Code, Fira Sans, Poppins, Ubuntu Sans, Crimson Pro, Lora, Newsreader, Literata, Source Serif 4, iA Writer Quattro |
| **Backend** | Tauri 2.10, Tokio, Reqwest, Axum (local HTTP), tower-http |
| **Database** | SQLite via `rusqlite` (bundled, WAL mode, dual-connection) |
| **MCP** | Custom JSON-RPC MCP client manager (Rust) |
| **Voice** | `whisper-rs` (STT), `sherpa-onnx` (TTS) |
| **Native** | `clipboard-rs`, `trash`, `notify` + debouncer, `open`, `walkdir`, `ignore`, `scraper`, `glob` |
| **Auth** | Bring-your-own-key AI providers (OpenAI / Anthropic / Google / custom) |
| **Persistence** | `tauri-plugin-store` (JSON config) + SQLite (structured data) |

---

## Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                              Genisys App                             │
├──────────────────────────────┬─────────────────────────────────────┤
│      React Frontend          │        Tauri / Rust Backend         │
│                              │                                     │
│  ActivityBar ─────────────── │ ─── Commands (IPC) ────────────────>│
│  AppShell                    │     ├─ AI providers (BYOK keys)     │
│  ├─ LeftPanel/Sidebar        │     ├─ LLM streaming (HTTP, stream) │
│  ├─ Main (per-app)           │     ├─ SQLite (rusqlite, WAL)       │
│  └─ RightPanel (framework)   │     ├─ Local Git (CLI)              │
│                              │     ├─ File system + watcher        │
│  Zustand stores (60+) ────── │ ─── plugin-store (JSON) ───────────>│
│  Tiptap / Monaco / xterm     │     ├─ MCP manager + clients        │
│  XYFlow / Mermaid            │     ├─ PTY terminals                │
│  ShortcutDispatcher          │     ├─ Whisper STT / Sherpa TTS     │
│  Right-Panel framework       │     ├─ Global shortcuts + Tray      │
│  AI tools framework          │     ├─ Axum local HTTP (per app)    │
│  Command Palette             │     └─ P2P messaging (mDNS + Noise) │
│                              │                                     │
│                              │                                     │
└──────────────────────────────┴─────────────────────────────────────┘
```

**Layout model:** `ActivityBar` selects the active app → `LeftPanel` (sidebar) shows secondary nav/history for that app → `Main` renders the app → `RightPanel` mounts contextual panels (AI assistant, ToC, search, timeline, etc.) via the panel framework.

---

## Prerequisites

| Requirement | Why | Install |
|---|---|---|
| **Node.js 18+** | Vite, frontend tooling | [nodejs.org](https://nodejs.org/) or `nvm install --lts` |
| **Rust 1.77.2+** | Tauri backend (compiles `src-tauri/`) | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| **CMake** | Builds native deps `whisper-rs-sys` (STT) and `sherpa-onnx-sys` (TTS) | macOS: `brew install cmake` · Linux: `apt install cmake` · Windows: [cmake.org](https://cmake.org/download/) |
| **Platform C/C++ toolchain** | Linker + system headers for Rust native crates | macOS: `xcode-select --install` · Linux: `apt install build-essential libssl-dev` · Windows: [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (Desktop dev with C++) + WebView2 |
| **LLVM / libclang** | `whisper-rs-sys` runs `bindgen`, which needs `libclang` to parse `whisper.h` | macOS: bundled with Xcode CLT (no action) · Linux: `apt install libclang-dev` · Windows: [LLVM](https://github.com/llvm/llvm-project/releases) **or** the VS *C++ Clang tools for Windows* component; if it isn't auto-detected, set `LIBCLANG_PATH` to its `bin` dir |
| **Tauri 2 platform prereqs** | Platform-specific WebView/runtime libs | See [v2.tauri.app/start/prerequisites](https://v2.tauri.app/start/prerequisites/) |

**Optional, for full features:**

- **An AI provider API key** (OpenAI, Anthropic, Google, or any OpenAI-compatible endpoint) — powers Chat, WebPoint, and the AI Assistant panels. Add it under **Settings → AI Providers**.

---

## Getting Started

### 1. Clone & install frontend deps

```bash
git clone <repo-url> && cd Genisys
npm install
```

### 2. Verify the Rust toolchain

```bash
# If you just installed rustup, source it (or open a new terminal):
. "$HOME/.cargo/env"

cargo --version    # should be >= 1.77.2
cmake --version    # should print a version
```

If `cargo` isn't found in new terminals, append this to `~/.zshrc` (or `~/.bashrc`):

```bash
. "$HOME/.cargo/env"
```

### 3. Run the app

```bash
# Dev mode — Vite dev server on :1420 + native window with hot reload
npm run tauri:dev

# Production binary (output: src-tauri/target/release/bundle/)
npm run tauri:build
```

> **First-run heads up:** the initial `tauri:dev` compiles ~500 Rust crates and can take 10–20 minutes. Subsequent runs are incremental and finish in seconds.
>
> If the cold build dies with `failed to run custom build command for whisper-rs-sys … (exit status: 101)`, it's almost always a transient parallel-build hiccup (many native C/C++ crates compiling at once), **not** a code error — just re-run `npm run tauri:dev`. On low-RAM machines, cap build parallelism (see [Troubleshooting](#troubleshooting)).

### Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `failed to run command cargo metadata` (os error 2) | Rust not installed | Install via rustup, then `. "$HOME/.cargo/env"` |
| `failed to execute command ... is cmake not installed?` (during `whisper-rs-sys` / `sherpa-onnx-sys` build) | Missing CMake | `brew install cmake` (or equivalent) |
| `Port 1420 is already in use` | Stale Vite process from a previous crashed run | `lsof -ti tcp:1420 \| xargs kill -9` |
| Linker errors mentioning `cc` / `ld` on macOS | Xcode Command Line Tools missing | `xcode-select --install` |
| `error: linker 'link.exe' not found` on Windows | Missing MSVC Build Tools | Install **Visual Studio Build Tools** with the *Desktop development with C++* workload |
| `failed to run custom build command for whisper-rs-sys … (exit status: 101)` on a cold build | Build-script **panic** — usually transient resource/parallelism pressure while many native crates compile C/C++ at once (not a code error) | Re-run `npm run tauri:dev` (a warm cache normally passes). If it persists on low-RAM machines, cap parallelism — macOS/Linux: `CARGO_BUILD_JOBS=2 npm run tauri:dev` · Windows PowerShell: `$env:CARGO_BUILD_JOBS=2; npm run tauri:dev`. Or pre-build the natives serially first: `cd src-tauri && cargo build -p whisper-rs-sys && cargo build -p sherpa-onnx` |
| `libclang.dll` / `libclang.so` not found, or `bindgen` errors building `whisper-rs-sys` | LLVM/libclang missing or not on `PATH` | Install **LLVM** (or the VS *C++ Clang tools* component); if still not found, set `LIBCLANG_PATH` to its `bin` directory |
| `LNK2005` / `LNK1169` "multiply defined symbol" on Windows | C-runtime mismatch between Rust (`/MD`) and the sherpa-onnx static-MT libs | Already handled by [src-tauri/.cargo/config.toml](src-tauri/.cargo/config.toml) (`+crt-static` + static `CMAKE_MSVC_RUNTIME_LIBRARY`); make sure you launch the build from the repo so that config is picked up |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server (frontend only) |
| `npm run build` | Build the frontend bundle |
| `npm run tauri:dev` | Launch the Tauri app in dev mode |
| `npm run tauri:build` | Build a production Tauri binary |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production frontend bundle locally |

---

## Project Structure

```
Genisys/
├── src/                              # React frontend
│   ├── App.tsx                       # Root + standalone-mode routing
│   ├── App.constants.ts              # Lazy app registry
│   ├── App.utils.ts                  # URL-mode helpers (focus, debug, time-machine, …)
│   ├── main.tsx                      # Entry point
│   ├── tauri-api-bridge.ts           # window.api → invoke wrappers
│   ├── ai/
│   │   ├── entity-links/             # entity:// link handlers + token parsing
│   │   └── tools/                    # Per-app AI tool catalogs
│   ├── components/                   # All app UIs (Dashboard, Chat, Notes, …)
│   ├── frameworks/                   # Cross-app frameworks
│   │   ├── app-switcher/
│   │   ├── keyboard-shortcut/
│   │   ├── notification/
│   │   ├── right-panel/
│   │   ├── shortcut-tooltip/
│   │   └── wysiwyg-editor/
│   ├── hooks/                        # Shared React hooks
│   ├── keyboard-shortcut-impl/       # Per-app shortcut actions
│   ├── LeftPanel/                    # Generic LeftPanel host
│   ├── lib/                          # Utilities (clipboard, formatting, …)
│   ├── right-panels/                 # Panel implementations
│   │   ├── AIAssistantPanel/
│   │   ├── DailyStatusPanel/
│   │   ├── Notes/
│   │   ├── SearchPanel/
│   │   ├── TimelinePanel/
│   │   └── TocPanel/
│   ├── store/                        # 60+ Zustand stores
│   └── themes/                       # Theme tokens, catalog, custom-theme APIs
├── src-tauri/                        # Rust backend
│   ├── src/
│   │   ├── lib.rs                    # Plugin + command registration
│   │   ├── main.rs                   # Entry point
│   │   ├── commands.rs               # Top-level command exports
│   │   ├── commands/                 # Per-domain commands (see below)
│   │   ├── database/                 # SQLite schema + queries
│   │   ├── mcp/                      # MCP client + manager
│   │   ├── file_walker.rs            # Walker for explorer
│   │   ├── global_shortcut/          # OS global shortcuts
│   │   └── tray/                     # macOS / Windows tray icon
│   ├── tauri.conf.json               # Tauri config (windows, CSP, bundle)
│   ├── capabilities/                 # Per-window capability files
│   └── Cargo.toml                    # Rust dependencies
├── @/components/ui/                  # Generated shadcn/Radix primitives
├── docs/                             # Feature plans & architecture notes
├── public/sounds/timer/              # Timer sound assets
├── package.json
├── vite.config.ts
├── tsconfig.json
└── eslint.config.js
```

---

## Backend (Rust) Modules

Commands are grouped by domain under [src-tauri/src/commands/](src-tauri/src/commands/):

| Module | Purpose |
|---|---|
| `ai_provider` | Bring-your-own-key AI provider config (OpenAI / Anthropic / Google / custom) |
| `chat`, `chat_commands` | Chat orchestration, tool calls, annotations |
| `code` | Shared file operations (read / write / walk / list dir) |
| `explorer`, `git`, `fs_watcher` | File-system, Git, change-notification |
| `library`, `research` | Book/chapter generation, webpage import, translations |
| `webpoint` | AI slide-deck generation + persistence (presentations / slides) |
| `previewer` | WebLinks persistence — link folders + saved page previews |
| `notes` | Notebooks / sections / topics / labels / notes / search |
| `daily_plan` | Plans, tasks, focus sessions |
| `prompts`, `prompt_manager` | Prompt CRUD + categories/folders |
| `api_client` | Collections, folders, requests, envs, cookies, snapshots, executions |
| `mock_server` | Mock-server lifecycle + routes |
| `clipboard` | Persistent clipboard items, labels, fuzzy search |
| `messaging` | Peer-to-peer LAN messaging — identity, mDNS discovery, Noise transport, peers, requests, text/image, typing, presence, reactions, call signaling |
| `quickshare` | LAN file/text drop hub (QR + WebRTC P2P, HTTP fallback, zip bundling) |
| `monitor` | Live camera/mic streaming to a LAN device over WebRTC |
| `usage` | App-usage session storage + stats (save / get / clear) |
| `timer` | Sessions, goals, milestones, tags, stats |
| `news` | Live news + interests + tiles |
| `themes` | Custom theme persistence |
| `tts`, `whisper` | Offline TTS (sherpa-onnx) + STT (whisper-rs) |
| `terminal` | PTY-backed terminals (portable-pty) |
| `remote_terminal` | Share a terminal session to a phone over LAN (QR + approval) |
| `mcp` | MCP manager + clients |
| `data_management`, `db_explorer` | Backup / reset / raw SQL access |
| `app_lifecycle`, `settings`, `zoom`, `notifications`, `projects`, `history` | App-wide plumbing |
| `ai_assistant` | AI Assistant sessions + persistence |

---

## Database

**Location:** `<app-data-dir>/com.genisys.app/.genisys-data/genisys.db` (SQLite, WAL mode, dual-connection — separate read/write connections behind a Mutex). On macOS that resolves to `~/Library/Application Support/com.genisys.app/.genisys-data/genisys.db`.

Tables span every app. A non-exhaustive list:

| Domain | Tables |
|---|---|
| Chat | `chat_conversations`, `chat_messages`, `chat_message_annotations`, `tool_calls`, `tool_call_summaries` |
| AI Assistant | `ai_assistant_sessions` |
| Notes | `notes`, `note_notebooks`, `note_sections`, `note_topics`, `note_labels`, `note_label_assignments` |
| Daily Plan | `daily_plan_*` |
| Library | `books`, `chapters`, `chapter_translations`, `bookmarks`, `webpages` |
| WebLinks | `weblinks_folders`, `weblinks_previews` |
| WebPoint | `presentations`, `slides` |
| Prompts | `prompts`, `pm_categories`, `pm_folders`, `pm_prompts` |
| Snippets | `snippets` |
| Clipboard | `clipboard_items`, `clipboard_labels`, `clipboard_item_labels` |
| Explorer | `explorer_history` |
| API Client | `api_collections`, `api_folders`, `api_requests`, `api_environments`, `api_environment_variables`, `api_cookies`, `api_snapshots`, `api_executions` |
| Timer | `timer_sessions`, `timer_goals`, `timer_milestones`, `timer_tags` |
| Usage | `app_usage_sessions` |
| News | `news_articles`, `news_interests`, `news_tile`, `live_sports_tiles` |
| Notifications | `notifications` |
| Commands | `commands` |

All SQL lives in per-operation files under [src-tauri/src/database/](src-tauri/src/database/) (one file per command).

> **Note:** the **Messages** app keeps all conversation content in memory only — messages, images, reactions, and calls are never written to SQLite.

---

## State Management

Zustand 5 stores per app, with Tauri plugin-store for JSON-backed app data. Selected stores (full list in [src/store/](src/store/)):

| Store | Purpose |
|---|---|
| `settings-store` | Global settings (zoom, layout, AI app modes, per-app prefs) |
| `navigation-store` | Active app mode + cross-feature navigation |
| `dashboard-store` | Dashboard tiles + layout |
| `theme-store`, `theme-catalog-store` | Active theme + custom themes |
| `chat-history-store`, `chat-cache/` | Conversations + paginated messages + streaming state |
| `prompt-manager-store`, `prompts-app-tabs-store/` | Prompt CRUD + tabbed UI |
| `notes-store`, `notes-app-store`, `note-*-store` | Notes domain (notebooks, sections, topics, labels) |
| `daily-plan-store/` | Daily plan tasks + focus sessions |
| `library-store/`, `library-cache/` | Library books / chapters / progress |
| `api-client-store` | Collections, requests, envs, executions |
| `mock-server-store/` | Mock server config |
| `clipboard-store/`, `clipboard-label-store/` | Clipboard history + labels |
| `messages-store` | Peer list, connection state, ephemeral conversations, call state |
| `timer-store/` | Timer sessions + stats |
| `command-palette-store/`, `command-palette-recents-store/`, `command-store` | ⌘K palette + recents |
| `terminal-store/` | PTY sessions |
| `settings-drawer-store/` | Settings drawer UI state |
| `confirm-dialog-store/`, `quit-confirm-store/` | Modal flows |
| `ai-inspector-store`, `ai-memory-store` | AI inspection + memory |
| `debug-store` | Debug panel request capture |
| `news-tile-store`, `live-scores-store` | Dashboard news/sports tiles |
| `bookmark-store`, `webpage-store`, `webpage-store.types` | Reading bookmarks |
| `fullscreen-clock-store`, `security-lock-store` | Lock screen + clock |
| `panel-toggle-registry`, `registry` | Right-panel + extension registries |

**Pattern:** optimistic UI + fire-and-forget async saves, debounced app-data patches (300–500ms) to coalesce rapid changes. Selectors return primitives (or `useShallow`) to avoid render loops — see workspace `zustand-pitfalls.md` notes.

---

## Themes

[src/themes/](src/themes/) defines a token catalog (`themeTokenCatalog.ts`) and exposes APIs for built-in + user-created themes. Custom themes persist via Rust commands ([src/themes/api/](src/themes/api/)). Active theme writes CSS variables to `:root` — no reload required.

- Multiple built-in light/dark themes (Arctic Mist, Ayu Light/Dark, Bluloco Light/Dark, Catppuccin Latte, Evergreen Meadow, GitHub Light, Lavender Haze, …).
- Auto-scheduler ([src/themes/auto-scheduler/](src/themes/auto-scheduler/)) can switch themes by time of day.
- Color picker ([src/components/ColorPicker/](src/components/ColorPicker/)) for custom theme editing.
- Monaco editor and chart themes derive from the same token set.

---

## Keyboard Shortcuts

All shortcuts are typed and registered with the framework — see [src/frameworks/keyboard-shortcut/](src/frameworks/keyboard-shortcut/) (`ALL_SHORTCUT_DEFS`, `GLOBAL_SHORTCUTS`). Per-app implementations bind actions under [src/keyboard-shortcut-impl/](src/keyboard-shortcut-impl/).

A small selection:

| Shortcut | Context | Action |
|---|---|---|
| `⌘K` | Global | Open Command Palette |
| `⌘=` / `⌘-` / `⌘0` | Global | Zoom in / out / reset |
| `Alt + ↑` / `Alt + ↓` | Diff Viewer | Prev / next change |
| `global.switchApp.*` | Global | Jump to a specific app (Dashboard, Chat, Notes, …) |
| `toggle-right-panel`, `toggle-sidebar` | Global | Show/hide panels |

OS-level global shortcuts (e.g. clipboard popover) use `tauri-plugin-global-shortcut` from the Rust side ([src-tauri/src/global_shortcut/](src-tauri/src/global_shortcut/)).

Conflicts are detected at runtime via `detectConflicts` / `getConflictsForShortcut` and surfaced in the shortcut settings UI.

---

## Windows & Multi-window

Configured in [src-tauri/tauri.conf.json](src-tauri/tauri.conf.json):

| Window | Purpose |
|---|---|
| `main` | Default Genisys shell (1200×800, maximized, decorated) |
| `timer-focus` | Detached always-on-top focus mini (360×360, transparent, no decorations), opened via `?mode=focus-mini&app=timer` |

Standalone modes (no shell) are routed in [src/App.tsx](src/App.tsx) via URL params:

- `?mode=focus-mini` → Timer focus mini
- `?mode=debug` → Debug Panel
- `?app=<app>` → A bundled app in standalone mode (no ActivityBar/Sidebar)

A system tray ([src-tauri/src/tray/](src-tauri/src/tray/)) provides quick access to clipboard, app switching, and quit.

---

## License

MIT
