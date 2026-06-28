//! axum router for the remote-terminal server: the embedded web client, its
//! vendored xterm assets, and the WebSocket endpoint. All assets are baked into
//! the binary (`include_str!`) so the feature works fully offline.

use axum::http::{header, StatusCode};
use axum::response::{Html, IntoResponse, Response};
use axum::routing::get;
use axum::Router;
use tauri::AppHandle;

use super::state::RemoteTerminalManager;
use super::ws::ws_handler;

/// Shared context handed to every route handler.
#[derive(Clone)]
pub struct RemoteCtx {
    pub app: AppHandle,
    pub manager: RemoteTerminalManager,
}

const INDEX_HTML: &str = include_str!("web/index.html");
const XTERM_JS: &str = include_str!("web/vendor/xterm.js");
const XTERM_CSS: &str = include_str!("web/vendor/xterm.css");
const ADDON_FIT_JS: &str = include_str!("web/vendor/addon-fit.js");

pub fn build_router(ctx: RemoteCtx) -> Router {
    Router::new()
        .route("/", get(index))
        .route("/vendor/xterm.js", get(xterm_js))
        .route("/vendor/xterm.css", get(xterm_css))
        .route("/vendor/addon-fit.js", get(addon_fit_js))
        .route("/favicon.ico", get(favicon))
        .route("/ws", get(ws_handler))
        .with_state(ctx)
}

async fn index() -> Html<&'static str> {
    Html(INDEX_HTML)
}

fn javascript(body: &'static str) -> Response {
    (
        [(header::CONTENT_TYPE, "application/javascript; charset=utf-8")],
        body,
    )
        .into_response()
}

async fn xterm_js() -> Response {
    javascript(XTERM_JS)
}

async fn addon_fit_js() -> Response {
    javascript(ADDON_FIT_JS)
}

async fn xterm_css() -> Response {
    ([(header::CONTENT_TYPE, "text/css; charset=utf-8")], XTERM_CSS).into_response()
}

async fn favicon() -> StatusCode {
    StatusCode::NO_CONTENT
}
