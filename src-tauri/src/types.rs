use serde::{Deserialize, Serialize};

// ─── Project Types ───────────────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Project {
    pub id: String,
    pub name: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ProjectsManifest {
    pub active_project_id: Option<String>,
    pub projects: Vec<Project>,
}

// ─── Chat Types ──────────────────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ChatMessage {
    pub id: String,
    pub role: String,
    pub content: String,
    pub timestamp: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sort_order: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none", default)]
    pub reasoning: Option<String>,
    /// JSON-serialized AIToolActivity[] (preserves frontend shape verbatim).
    #[serde(skip_serializing_if = "Option::is_none", default)]
    pub activities_json: Option<String>,
    /// Per-message context inclusion override.
    /// `None` = auto (governed by the conversation's auto-window),
    /// `Some(1)` = force include in the AI prompt,
    /// `Some(0)` = force exclude from the AI prompt.
    #[serde(skip_serializing_if = "Option::is_none", default)]
    pub context_mode: Option<i64>,
    /// JSON-serialized array of stored chat-image filenames (e.g. `["<uuid>.png"]`)
    /// attached to a user message. `None` / empty = no images.
    #[serde(skip_serializing_if = "Option::is_none", default)]
    pub images: Option<Vec<String>>,
}
/// recording what task was being performed and how/why the AI responded.
/// Stored in `chat_message_annotations`.
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MessageAnnotation {
    pub id: String,
    pub message_id: String,
    pub task_summary: String,
    pub chosen_option: String,
    pub reasoning: String,
    pub alternatives: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ChatConversation {
    pub id: String,
    pub title: String,
    pub messages: Vec<ChatMessage>,
    pub created_at: String,
    pub updated_at: String,
}

/// Lightweight conversation metadata (no messages loaded)
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ChatConversationMeta {
    pub id: String,
    pub title: String,
    pub message_count: i64,
    pub created_at: String,
    pub updated_at: String,
}

/// Paginated messages result for cursor-based loading
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ChatMessagesPage {
    pub messages: Vec<ChatMessage>,
    pub has_more: bool,
}

// ─── Tool Call Types ─────────────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ToolCallRecord {
    pub id: String,
    pub message_id: String,
    pub conversation_id: String,
    pub tool_name: String,
    pub args: String,
    pub result: Option<String>,
    pub status: String,
    pub started_at: String,
    pub completed_at: Option<String>,
    pub sort_order: i64,
}

// ─── Tool Call Summary Types ─────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ToolCallSummary {
    pub message_id: String,
    pub total_count: i64,
    pub done_count: i64,
    pub first_started_at: String,
    pub last_completed_at: Option<String>,
    pub total_duration_ms: i64,
}

// ─── AI Assistant Session Types ──────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AIAssistantSessionMeta {
    pub id: String,
    pub app_id: String,
    /// Optional scope tag (e.g. an org/project/repo/PR key) used by PR-scoped
    /// panels so history can be filtered per-PR. `None` for unscoped apps.
    #[serde(default)]
    pub scope_key: Option<String>,
    pub conversation_id: String,
    pub title: String,
    pub created_at: String,
    pub updated_at: String,
}

fn default_tile_width() -> String {
    "third".to_string()
}

// ─── Live Sports Types ───────────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LiveSportTile {
    pub id: String,
    pub query: String,
    pub sport_key: String,
    pub created_at: String,
    #[serde(default = "default_refresh_interval")]
    pub refresh_interval_ms: i64,
    #[serde(default = "default_tile_width")]
    pub tile_width: String,
    #[serde(default)]
    pub source_url: String,
    #[serde(default = "default_true")]
    pub notify_on_score: bool,
    #[serde(default = "default_true")]
    pub notify_on_status: bool,
    #[serde(default)]
    pub notify_on_period: bool,
    #[serde(default = "default_notify_channel")]
    pub notify_when_focused: String,
    #[serde(default = "default_notify_channel")]
    pub notify_when_unfocused: String,
    #[serde(default = "default_true")]
    pub auto_delete_on_end: bool,
}

fn default_true() -> bool {
    true
}

fn default_notify_channel() -> String {
    "os".to_string()
}

fn default_refresh_interval() -> i64 {
    60_000
}

// ─── News Tile Types ─────────────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NewsTile {
    pub id: String,
    pub tile_width: String,
    pub refresh_interval_ms: i64,
    pub last_refreshed_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NewsInterest {
    pub id: String,
    pub tile_id: String,
    pub category_key: String,
    pub label: String,
    pub custom_prompt: String,
    pub resolved_url: Option<String>,
    pub position: i64,
    pub last_refreshed_at: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NewsArticle {
    pub id: String,
    pub interest_id: String,
    pub source_type: String,
    pub title: String,
    pub summary: String,
    pub url: String,
    pub source_name: String,
    pub author: String,
    pub published_at: Option<String>,
    pub fetched_at: String,
    pub is_liked: bool,
    pub liked_at: Option<String>,
    pub raw_hash: String,
    pub extras_json: String,
}

// ─── Explorer Types ──────────────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ExplorerRepoEntry {
    pub id: Option<i64>,
    pub repository: String,
    pub source: String,
    pub organization: String,
    pub project: String,
    pub local_path: Option<String>,
    pub last_opened_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ExplorerHistoryPage {
    pub items: Vec<ExplorerRepoEntry>,
    pub has_more: bool,
}

// ─── Settings Types ──────────────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ProjectSettings {
    pub organization: String,
    pub project: String,
    pub repository: String,
    pub creator: String,
}

impl Default for ProjectSettings {
    fn default() -> Self {
        Self {
            organization: String::new(),
            project: String::new(),
            repository: String::new(),
            creator: String::new(),
        }
    }
}

// ─── API Result ──────────────────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ApiResult<T> {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

impl<T> ApiResult<T> {
    pub fn ok(data: T) -> Self {
        Self { success: true, data: Some(data), error: None }
    }
    pub fn err(msg: impl Into<String>) -> Self {
        Self { success: false, data: None, error: Some(msg.into()) }
    }
}

// ─── Window State ────────────────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct WindowState {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    pub is_maximized: bool,
}

// ─── Snippet Types ───────────────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Snippet {
    pub id: String,
    pub title: String,
    pub content: String,
    pub conversation_id: Option<String>,
    pub is_favorite: bool,
    pub created_at: String,
    pub updated_at: String,
}

// ─── Previewer Collection Types ──────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PreviewFolder {
    pub id: String,
    pub name: String,
    pub color: String,            // empty string when unset
    pub parent_id: Option<String>,
    pub sort_order: i64,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SavedPreview {
    pub id: String,
    pub folder_id: Option<String>,
    pub url: String,
    pub final_url: String,
    pub title: String,
    pub description: String,
    pub site_name: String,
    pub favicon_url: String,
    pub image_url: String,
    pub theme_color: String,
    pub embeddable: String,       // 'yes' | 'no' | 'unknown'
    pub notes: String,            // empty string when none
    pub sort_order: i64,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct BrowserBookmarkSource {
    pub browser: String,
    pub profile: String,
    pub label: String,
    pub path: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct BrowserApp {
    pub id: String,
    pub name: String,
    pub app_name: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct BrowserBookmark {
    pub title: String,
    pub url: String,
    pub folder_path: String,
}

// ─── Prompt Types ────────────────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Prompt {
    pub id: String,
    pub title: String,
    pub description: String,
    pub content: String,
    pub tags: Vec<String>,
    pub is_favorite: bool,
    pub usage_count: i64,
    pub last_used_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub metadata: serde_json::Value,
}

// ─── Library Book Types ────────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Book {
    pub id: String,
    pub title: String,
    pub description: String,
    pub status: String,         // "generating" | "completed" | "error"
    pub chapter_count: i64,
    #[serde(default)]
    pub model: String,
    #[serde(default = "default_language")]
    pub language: String,
    #[serde(default)]
    pub generation_duration_ms: Option<i64>,
    pub created_at: String,
    pub updated_at: String,
}

fn default_language() -> String { "english".to_string() }

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Chapter {
    pub id: String,
    pub book_id: String,
    pub chapter_number: i64,
    pub title: String,
    pub content: String,
    pub status: String,         // "pending" | "generating" | "completed" | "error"
    pub sort_order: i64,
    #[serde(default)]
    pub is_read: bool,
    #[serde(default = "default_language")]
    pub language: String,
    #[serde(default)]
    pub generation_duration_ms: Option<i64>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ChapterTranslation {
    pub id: String,
    pub chapter_id: String,
    pub language: String,
    pub content: String,
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
}

/// Lightweight book metadata (no chapters loaded)
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct BookMeta {
    pub id: String,
    pub title: String,
    pub description: String,
    pub status: String,
    pub chapter_count: i64,
    #[serde(default)]
    pub model: String,
    #[serde(default = "default_language")]
    pub language: String,
    #[serde(default)]
    pub generation_duration_ms: Option<i64>,
    pub created_at: String,
    pub updated_at: String,
}

/// A book with all its chapters
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct BookWithChapters {
    pub book: BookMeta,
    pub chapters: Vec<Chapter>,
}

// ─── Bookmark Types ──────────────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Bookmark {
    pub id: String,
    pub book_id: String,
    pub chapter_id: String,
    pub highlight_id: String,
    pub label: String,
    pub note: String,
    pub created_at: String,
}

/// Bookmark with denormalized book/chapter info for display
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct BookmarkWithContext {
    pub id: String,
    pub book_id: String,
    pub chapter_id: String,
    pub highlight_id: String,
    pub label: String,
    pub note: String,
    pub created_at: String,
    pub book_title: String,
    pub chapter_title: String,
    pub chapter_number: i64,
}

// ─── WebPoint Presentation Types ─────────────────────────────────

/// Lightweight presentation metadata (no slides loaded).
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PresentationMeta {
    pub id: String,
    #[serde(default)]
    pub title: String,
    #[serde(default)]
    pub description: String,
    pub slide_count: i64,
    #[serde(default = "default_presentation_theme")]
    pub theme: String,
    pub created_at: String,
    pub updated_at: String,
}

fn default_presentation_theme() -> String { "default".to_string() }

/// A single slide. `data` holds the structured slide JSON model verbatim and is
/// stored as a TEXT column on disk.
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Slide {
    pub id: String,
    pub presentation_id: String,
    pub sort_order: i64,
    #[serde(default)]
    pub title: String,
    #[serde(default)]
    pub notes: String,
    #[serde(default)]
    pub data: serde_json::Value,
    pub created_at: String,
    pub updated_at: String,
}

/// A presentation together with all of its slides (ordered by `sort_order`).
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PresentationWithSlides {
    pub presentation: PresentationMeta,
    pub slides: Vec<Slide>,
}

// ─── Saved Webpage Types ─────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SavedWebpage {
    pub id: String,
    pub name: String,
    pub url: String,
    pub file_path: String,
    pub file_size: i64,
    pub created_at: String,
    pub updated_at: String,
}

// ─── Prompt Manager Types ────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PmFolder {
    pub id: String,
    pub name: String,
    pub color: String,
    /// AppView ids this folder is scoped to. Empty = available in every AI surface.
    #[serde(default)]
    pub scopes: Vec<String>,
    pub sort_order: i64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PmCategory {
    pub id: String,
    pub folder_id: String,
    pub name: String,
    pub icon: String,
    pub sort_order: i64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PmPrompt {
    pub id: String,
    pub category_id: String,
    pub folder_id: String,
    pub title: String,
    pub content: String,
    pub description: String,
    pub is_pinned: bool,
    pub sort_order: i64,
    pub created_at: String,
    pub updated_at: String,
    /// App-view ids this prompt is restricted to. `None`/empty = visible in
    /// every app surface (backward-compatible). Stored as a JSON array.
    #[serde(default)]
    pub app_scopes: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PmFullData {
    pub folders: Vec<PmFolder>,
    pub categories: Vec<PmCategory>,
    pub prompts: Vec<PmPrompt>,
}

// ─── ChatCommand Types ───────────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ChatCommand {
    pub id: String,
    pub name: String,
    pub description: String,
    pub tool_name: String,
    pub args_template: String,
    pub is_built_in: bool,
    pub sort_order: i64,
    pub created_at: String,
    pub updated_at: String,
}

// ─── Notification Types ──────────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NotificationRecord {
    pub id: String,
    #[serde(rename = "type")]
    pub notification_type: String,
    pub channel: String,
    pub source: String,
    pub title: String,
    pub message: String,
    pub icon: Option<String>,
    pub actions: Option<String>,
    pub meta: Option<String>,
    pub read: bool,
    pub created_at: String,
    pub expires_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NotificationPage {
    pub items: Vec<NotificationRecord>,
    pub has_more: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NotificationFilters {
    pub notification_type: Option<String>,
    pub channel: Option<String>,
    pub source: Option<String>,
    pub read: Option<bool>,
}

// ─── Stocks Tile Types ───────────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct StocksTile {
    pub id: String,
    pub tile_width: String,
    pub refresh_interval_ms: i64,
    pub auto_refresh_enabled: bool,
    pub last_refreshed_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct StockWatchItem {
    pub id: String,
    pub tile_id: String,
    pub symbol: String,
    pub short_name: String,
    pub long_name: String,
    pub exchange: String,
    pub quote_type: String,
    pub custom_news_url: Option<String>,
    pub custom_price_url: Option<String>,
    pub alert_above: Option<f64>,
    pub alert_below: Option<f64>,
    pub alert_enabled: bool,
    pub position: i64,
    pub last_refreshed_at: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct StockQuote {
    pub symbol: String,
    pub price: f64,
    pub prev_close: f64,
    pub change_pct: f64,
    pub day_high: Option<f64>,
    pub day_low: Option<f64>,
    pub day_open: Option<f64>,
    pub volume: Option<i64>,
    pub fifty_two_week_high: Option<f64>,
    pub fifty_two_week_low: Option<f64>,
    pub currency: String,
    pub market_state: String,
    pub fetched_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct StockHistoryPoint {
    pub t: i64,
    pub c: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct StockNewsItem {
    pub id: String,
    pub watchlist_id: String,
    pub source_type: String,
    pub title: String,
    pub summary: String,
    pub why_it_matters: String,
    pub url: String,
    pub publisher: String,
    pub published_at: Option<String>,
    pub fetched_at: String,
    pub raw_hash: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct StockSearchResult {
    pub symbol: String,
    pub short_name: String,
    pub long_name: String,
    pub exchange: String,
    pub quote_type: String,
}

// ─── API Client Types ────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Workspace {
    pub id: String,
    pub name: String,
    pub description: String,
    pub is_default: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ApiCollection {
    pub id: String,
    pub workspace_id: String,
    pub name: String,
    pub description: String,
    pub color: String,
    pub sort_order: i64,
    #[serde(default)]
    pub deleted_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ApiFolder {
    pub id: String,
    pub workspace_id: String,
    pub collection_id: String,
    #[serde(default)]
    pub parent_folder_id: Option<String>,
    pub name: String,
    pub sort_order: i64,
    #[serde(default)]
    pub deleted_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ApiRequest {
    pub id: String,
    pub workspace_id: String,
    pub collection_id: String,
    #[serde(default)]
    pub folder_id: Option<String>,
    pub name: String,
    pub method: String,
    pub url: String,
    pub params: String,
    pub headers: String,
    pub body_type: String,
    pub body_content: String,
    pub auth_type: String,
    pub auth_data: String,
    #[serde(default)]
    pub default_environment_id: Option<String>,
    pub sort_order: i64,
    #[serde(default)]
    pub deleted_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ApiEnvironment {
    pub id: String,
    pub workspace_id: String,
    pub name: String,
    pub base_url: String,
    pub description: String,
    pub color: String,
    pub is_active: bool,
    pub sort_order: i64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ApiEnvironmentVariable {
    pub id: String,
    pub environment_id: String,
    pub key: String,
    pub value: String,
    pub initial_value: String,
    pub is_secret: bool,
    pub description: String,
    pub enabled: bool,
    pub sort_order: i64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ApiRequestExecution {
    pub id: String,
    #[serde(default)]
    pub request_id: Option<String>,
    #[serde(default)]
    pub environment_id: Option<String>,
    pub workspace_id: String,
    pub name: String,
    pub method: String,
    pub url: String,
    pub resolved_url: String,
    pub headers_snapshot: String,
    pub body_snapshot: String,
    pub auth_snapshot: String,
    pub status: String,
    #[serde(default)]
    pub error_message: Option<String>,
    pub duration_ms: i64,
    pub executed_at: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ApiExecutionResponse {
    pub id: String,
    pub execution_id: String,
    pub status_code: i64,
    pub status_text: String,
    pub headers: String,
    pub body: String,
    pub body_storage_type: String,
    #[serde(default)]
    pub blob_path: Option<String>,
    pub size_bytes: i64,
    pub timing_total_ms: i64,
    #[serde(default)]
    pub timing_dns_ms: Option<i64>,
    #[serde(default)]
    pub timing_connect_ms: Option<i64>,
    #[serde(default)]
    pub timing_tls_ms: Option<i64>,
    #[serde(default)]
    pub timing_ttfb_ms: Option<i64>,
    #[serde(default)]
    pub timing_download_ms: Option<i64>,
    pub received_at: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ApiCookieJar {
    pub id: String,
    pub workspace_id: String,
    #[serde(default)]
    pub environment_id: Option<String>,
    pub name: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ApiCookie {
    pub id: String,
    pub jar_id: String,
    pub name: String,
    pub value: String,
    pub domain: String,
    pub path: String,
    pub secure: bool,
    pub http_only: bool,
    pub same_site: String,
    #[serde(default)]
    pub expires_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ApiResponseSnapshot {
    pub id: String,
    pub execution_id: String,
    #[serde(default)]
    pub request_id: Option<String>,
    pub label: String,
    pub snapshot_type: String,
    pub status_code: i64,
    pub status_text: String,
    pub headers: String,
    pub body: String,
    pub size_bytes: i64,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ApiSavedExample {
    pub id: String,
    #[serde(default)]
    pub request_id: Option<String>,
    #[serde(default)]
    pub execution_id: Option<String>,
    pub name: String,
    pub description: String,
    pub status_code: i64,
    pub headers: String,
    pub body: String,
    pub created_at: String,
    pub updated_at: String,
}

/// History list item (lightweight, no response body)
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ApiHistoryEntry {
    pub id: String,
    #[serde(default)]
    pub request_id: Option<String>,
    pub name: String,
    pub method: String,
    pub url: String,
    pub status: String,
    pub status_code: i64,
    pub duration_ms: i64,
    pub size_bytes: i64,
    pub executed_at: String,
    #[serde(default)]
    pub environment_name: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ApiAnalyticsPoint {
    pub id: String,
    pub executed_at: String,
    pub method: String,
    pub status: String,
    pub status_code: i64,
    pub duration_ms: i64,
    pub size_bytes: i64,
    #[serde(default)]
    pub timing_dns_ms: Option<i64>,
    #[serde(default)]
    pub timing_connect_ms: Option<i64>,
    #[serde(default)]
    pub timing_tls_ms: Option<i64>,
    #[serde(default)]
    pub timing_ttfb_ms: Option<i64>,
    #[serde(default)]
    pub timing_download_ms: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ApiClientData {
    pub collections: Vec<ApiCollection>,
    pub folders: Vec<ApiFolder>,
    pub requests: Vec<ApiRequest>,
    pub environments: Vec<ApiEnvironment>,
    pub active_environment_id: Option<String>,
    pub workspaces: Vec<Workspace>,
}

// ─── Notes ───────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Note {
    pub id: String,
    pub app_id: String,
    pub scope_type: String,
    pub scope_id: String,
    pub title: String,
    pub content: String,
    pub is_pinned: bool,
    pub created_at: String,
    pub updated_at: String,
    pub notebook_id: Option<String>,
    pub section_id: Option<String>,
    pub topic_id: Option<String>,
    pub labels: Vec<String>,
    pub source: Option<String>,
    pub sort_order: i64,
    pub color: Option<String>,
    pub emoji: Option<String>,
    pub is_favorite: bool,
    pub is_trashed: bool,
    pub trashed_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NoteHighlight {
    pub id: String,
    pub note_id: String,
    pub text: String,
    pub from_pos: i64,
    pub to_pos: i64,
    pub note: String,
    pub created_at: String,
    pub updated_at: String,
}

// ─── Note Projects ───────────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NoteProject {
    pub id: String,
    pub name: String,
    pub color: Option<String>,
    pub icon: Option<String>,
    pub emoji: Option<String>,
    pub is_system: bool,
    pub is_favorite: bool,
    pub sort_order: i64,
    pub sort_preference: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

// ─── Note Notebooks ──────────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NoteNotebook {
    pub id: String,
    pub name: String,
    pub color: Option<String>,
    pub icon: Option<String>,
    pub emoji: Option<String>,
    pub is_system: bool,
    pub sort_order: i64,
    pub project_id: Option<String>,
    pub sort_preference: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

// ─── Note Sections ───────────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NoteSection {
    pub id: String,
    pub notebook_id: String,
    pub name: String,
    pub color: Option<String>,
    pub icon: Option<String>,
    pub emoji: Option<String>,
    pub sort_order: i64,
    pub created_at: String,
    pub updated_at: String,
}

// ─── Note Topics ─────────────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NoteTopic {
    pub id: String,
    pub section_id: String,
    pub name: String,
    pub color: Option<String>,
    pub icon: Option<String>,
    pub emoji: Option<String>,
    pub sort_order: i64,
    pub created_at: String,
    pub updated_at: String,
}

// ─── Note Labels ─────────────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NoteLabel {
    pub id: String,
    pub name: String,
    pub color: Option<String>,
    pub created_at: String,
}

// ─── Daily Plan Types ────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DPTask {
    pub id: String,
    pub title: String,
    pub description: String,
    pub status: String,
    pub priority: String,
    pub category_id: Option<String>,
    pub scheduled_date: String,
    pub scheduled_time: Option<String>,
    pub duration_minutes: i64,
    pub reminder_at: Option<String>,
    pub sort_order: i64,
    pub completed_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DPMeeting {
    pub id: String,
    pub title: String,
    pub description: String,
    pub scheduled_date: String,
    pub start_time: String,
    pub end_time: String,
    pub location: String,
    pub meeting_link: String,
    pub reminder_at: Option<String>,
    pub status: String,
    pub meeting_type: String,
    pub priority: String,
    pub notes: String,
    pub follow_up: String,
    pub agenda: String,
    pub outcome: String,
    pub attendees: String,
    pub cancel_reason: String,
    pub sort_order: i64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DPReview {
    pub id: String,
    pub title: String,
    pub description: String,
    pub status: String,
    pub priority: String,
    pub review_type: String,
    pub link: String,
    pub author_name: String,
    pub author_avatar_url: String,
    pub scheduled_date: String,
    pub scheduled_time: Option<String>,
    pub duration_minutes: i64,
    pub reminder_at: Option<String>,
    pub sort_order: i64,
    pub completed_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DPDailyEntry {
    pub id: String,
    pub date: String,
    pub motivational_quote: String,
    pub status_content: String,
    pub yesterday_review: String,
    pub work_start_time: Option<String>,
    pub work_end_time: Option<String>,
    pub lunch_start_time: Option<String>,
    pub lunch_end_time: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DPDailyStatus {
    pub date: String,
    pub content: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DPCategory {
    pub id: String,
    pub name: String,
    pub color: String,
    pub icon: String,
    pub sort_order: i64,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DPTemplate {
    pub id: String,
    pub name: String,
    pub description: String,
    pub template_type: String,
    pub content: String,
    pub is_built_in: bool,
    pub sort_order: i64,
    pub created_at: String,
    pub updated_at: String,
}

// ─── Clipboard Types ─────────────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ClipboardLabel {
    pub id: String,
    pub name: String,
    pub color: String,
    pub created_at: String,
}

/// A single sensitive-data match within a clipboard text item. Computed once at
/// capture time and persisted; serialized to the frontend as
/// `{ type, label, level, start, end }`.
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SensitivityMatch {
    #[serde(rename = "type")]
    pub kind: String,
    pub label: String,
    pub level: String,
    pub start: i64,
    pub end: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ClipboardItem {
    pub id: String,
    pub content_type: String,
    pub text_content: Option<String>,
    pub image_path: Option<String>,
    pub thumbnail_path: Option<String>,
    pub is_pinned: bool,
    pub created_at: String,
    pub content_hash: String,
    pub byte_size: i64,
    #[serde(default)]
    pub labels: Vec<ClipboardLabel>,
    #[serde(default)]
    pub image_description: Option<String>,
    #[serde(default = "default_analysis_status")]
    pub analysis_status: String,
    #[serde(default)]
    pub extracted_text: Option<String>,
    /// Smart-collection category keys (e.g. "url", "code"), computed at capture.
    #[serde(default)]
    pub smart_categories: Vec<String>,
    /// Highest sensitivity level found ("none" | "low" | "medium" | "high" | "critical").
    #[serde(default = "default_sensitivity_level")]
    pub sensitivity_level: String,
    /// Individual sensitive-data matches (for masking + badge counts).
    #[serde(default)]
    pub sensitivity_matches: Vec<SensitivityMatch>,
}

fn default_analysis_status() -> String {
    "none".to_string()
}

fn default_sensitivity_level() -> String {
    "none".to_string()
}

// ─── Code Diagrams ───────────────────────────────────────────────
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CodeDiagramMeta {
    pub id: String,
    pub title: String,
    pub root_path: Option<String>,
    pub source_file: Option<String>,
    pub source_selection_start_line: Option<i64>,
    pub source_selection_end_line: Option<i64>,
    pub root_symbol: Option<String>,
    pub node_count: i64,
    pub edge_count: i64,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CodeDiagramLoadResult {
    pub meta: CodeDiagramMeta,
    pub blob_json: String,
}
