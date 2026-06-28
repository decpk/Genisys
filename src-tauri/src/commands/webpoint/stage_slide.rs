use serde_json::Value;
use tauri::State;

use super::render_state::WebpointRenderState;

/// Stage a compiled slide's HTML so the `webpoint://` scheme handler can serve
/// it. Called by the stage just before (re)loading the sandboxed iframe.
#[tauri::command]
pub fn cmd_webpoint_stage_slide(
    state: State<'_, WebpointRenderState>,
    slide_id: String,
    html: String,
) -> Value {
    state.set(slide_id, html);
    serde_json::json!({"success": true})
}
