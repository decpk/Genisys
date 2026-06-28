//! axum router for the Monitor server: the embedded viewer web client and the
//! WebSocket signaling endpoint. The page is baked into the binary
//! (`include_str!`) so the feature works fully offline. Unlike the remote
//! terminal there are no vendored assets — the viewer is a single self-contained
//! HTML file using only built-in browser WebRTC APIs.

use axum::http::StatusCode;
use axum::response::Html;
use axum::routing::get;
use axum::Router;
use tauri::AppHandle;

use super::state::MonitorManager;
use super::ws::ws_handler;

/// Shared context handed to every route handler.
#[derive(Clone)]
pub struct MonitorCtx {
    pub app: AppHandle,
    pub manager: MonitorManager,
}

const INDEX_HTML: &str = include_str!("web/index.html");

pub fn build_router(ctx: MonitorCtx) -> Router {
    Router::new()
        .route("/", get(index))
        .route("/favicon.ico", get(favicon))
        .route("/ws", get(ws_handler))
        .with_state(ctx)
}

async fn index() -> Html<&'static str> {
    Html(INDEX_HTML)
}

async fn favicon() -> StatusCode {
    StatusCode::NO_CONTENT
}
