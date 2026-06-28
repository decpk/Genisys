use serde_json::Value;
use std::sync::Mutex;
use tauri::webview::WebviewBuilder;
use tauri::{LogicalPosition, LogicalSize, Manager, WebviewUrl};
use url::Url;

/// Stable label for the single native child webview that renders live website
/// previews inside the Previewer app's content region.
const PREVIEW_WEBVIEW_LABEL: &str = "previewer-embed";

/// Label of the app's main window (the implicit default from `tauri.conf.json`).
const MAIN_WINDOW_LABEL: &str = "main";

/// Remembers the URL the preview webview was last asked to load.
///
/// Repeated `show` calls (e.g. on reposition / re-show after occlusion) must not
/// trigger a reload. Comparing against the webview's *live* URL is unreliable
/// because pages can redirect (auth flows), so we track the requested URL here.
#[derive(Default)]
pub struct PreviewerWebviewState {
    last_url: Mutex<Option<String>>,
}

impl PreviewerWebviewState {
    pub fn new() -> Self {
        Self::default()
    }
}

fn ok() -> Value {
    serde_json::json!({ "success": true })
}

fn fail(message: impl Into<String>) -> Value {
    serde_json::json!({ "success": false, "error": message.into() })
}

/// Create (or reuse) the native preview webview, position it over the given
/// logical rectangle, ensure it is visible, and navigate it to `url` when the
/// requested URL differs from the one last loaded.
#[tauri::command]
pub fn cmd_previewer_webview_show(
    app: tauri::AppHandle,
    state: tauri::State<'_, PreviewerWebviewState>,
    url: String,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
) -> Value {
    let parsed = match Url::parse(&url) {
        Ok(parsed) => parsed,
        Err(e) => return fail(format!("Invalid URL: {e}")),
    };
    if !matches!(parsed.scheme(), "http" | "https") {
        return fail("Only http and https URLs can be previewed");
    }

    let position = LogicalPosition::new(x, y);
    let size = LogicalSize::new(width.max(1.0), height.max(1.0));

    // Reuse the existing webview when present: reposition, show, and navigate
    // only when the requested URL actually changed.
    if let Some(webview) = app.get_webview(PREVIEW_WEBVIEW_LABEL) {
        let _ = webview.set_position(position);
        let _ = webview.set_size(size);
        let _ = webview.show();

        let mut last_url = state.last_url.lock().unwrap();
        if last_url.as_deref() != Some(url.as_str()) {
            let _ = webview.navigate(parsed);
            *last_url = Some(url);
        }
        return ok();
    }

    // Otherwise create a new child webview attached to the main window.
    let Some(window) = app.get_window(MAIN_WINDOW_LABEL) else {
        return fail("main window not found");
    };
    let builder = WebviewBuilder::new(PREVIEW_WEBVIEW_LABEL, WebviewUrl::External(parsed));

    match window.add_child(builder, position, size) {
        Ok(_) => {
            *state.last_url.lock().unwrap() = Some(url);
            ok()
        }
        Err(e) => fail(format!("Failed to create preview webview: {e}")),
    }
}

/// Reposition / resize the preview webview without changing visibility or
/// navigating. Used on the high-frequency resize path. No-op when absent.
#[tauri::command]
pub fn cmd_previewer_webview_set_bounds(
    app: tauri::AppHandle,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
) -> Value {
    if let Some(webview) = app.get_webview(PREVIEW_WEBVIEW_LABEL) {
        let _ = webview.set_position(LogicalPosition::new(x, y));
        let _ = webview.set_size(LogicalSize::new(width.max(1.0), height.max(1.0)));
    }
    ok()
}

/// Hide the preview webview (kept alive for reuse). No-op when absent.
#[tauri::command]
pub fn cmd_previewer_webview_hide(app: tauri::AppHandle) -> Value {
    if let Some(webview) = app.get_webview(PREVIEW_WEBVIEW_LABEL) {
        let _ = webview.hide();
    }
    ok()
}

/// Reload the page currently loaded in the preview webview. No-op when absent.
#[tauri::command]
pub fn cmd_previewer_webview_reload(app: tauri::AppHandle) -> Value {
    if let Some(webview) = app.get_webview(PREVIEW_WEBVIEW_LABEL) {
        let _ = webview.reload();
    }
    ok()
}

/// Destroy the preview webview and forget the last-loaded URL. No-op when absent.
#[tauri::command]
pub fn cmd_previewer_webview_close(
    app: tauri::AppHandle,
    state: tauri::State<'_, PreviewerWebviewState>,
) -> Value {
    if let Some(webview) = app.get_webview(PREVIEW_WEBVIEW_LABEL) {
        let _ = webview.close();
    }
    *state.last_url.lock().unwrap() = None;
    ok()
}
