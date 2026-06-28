use crate::commands::AppState;
use crate::commands::err_val;
use crate::database::{
    load_research_sources_db, save_research_source_db, remove_research_source_db,
};
use serde_json::Value;
use tauri::State;

// ─── Sources (used by Chat-attached sources flow) ─────────────────

#[tauri::command]
pub fn cmd_load_research_sources(state: State<'_, AppState>, session_id: String) -> Value {
    let sources = load_research_sources_db(&state.db, &session_id);
    serde_json::to_value(sources).unwrap_or(serde_json::json!([]))
}

#[tauri::command]
pub fn cmd_save_research_source(state: State<'_, AppState>, source: Value) -> Value {
    match save_research_source_db(&state.db, &source) {
        Ok(()) => serde_json::json!({"success": true}),
        Err(e) => err_val(e),
    }
}

#[tauri::command]
pub fn cmd_remove_research_source(state: State<'_, AppState>, source_id: String) -> Value {
    match remove_research_source_db(&state.db, &source_id) {
        Ok(()) => serde_json::json!({"success": true}),
        Err(e) => err_val(e),
    }
}
