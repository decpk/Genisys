//! axum router for the QuickShare server: the embedded web client, the
//! WebSocket endpoint (presence + tray sync + text), and the HTTP file
//! upload/download routes. The page is baked into the binary (`include_str!`)
//! so the feature works fully offline — a single self-contained HTML file.

use axum::http::StatusCode;
use axum::response::Html;
use axum::routing::{get, post};
use axum::Router;
use tauri::AppHandle;

use super::download::download_file;
use super::download_all_zip::download_all_zip;
use super::state::QuickShareManager;
use super::upload::{begin_upload, upload_abort, upload_chunk, upload_file, upload_finish};
use super::ws::ws_handler;

/// Shared context handed to every route handler.
#[derive(Clone)]
pub struct QuickCtx {
    pub app: AppHandle,
    pub manager: QuickShareManager,
}

const INDEX_HTML: &str = include_str!("web/index.html");

pub fn build_router(ctx: QuickCtx) -> Router {
    Router::new()
        .route("/", get(index))
        .route("/favicon.ico", get(favicon))
        .route("/ws", get(ws_handler))
        .route("/upload", post(upload_file))
        .route("/upload/begin", post(begin_upload))
        .route("/upload/chunk", post(upload_chunk))
        .route("/upload/finish", post(upload_finish))
        .route("/upload/abort", post(upload_abort))
        .route("/file/:id", get(download_file))
        .route("/download-all.zip", get(download_all_zip))
        .with_state(ctx)
}

async fn index() -> Html<&'static str> {
    Html(INDEX_HTML)
}

async fn favicon() -> StatusCode {
    StatusCode::NO_CONTENT
}
