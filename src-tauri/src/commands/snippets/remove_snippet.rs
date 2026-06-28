use crate::commands::AppState;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_remove_snippet(state: State<'_, AppState>, snippet_id: String) -> Value {
    state.db.conn().execute("DELETE FROM snippets WHERE id=?1", rusqlite::params![snippet_id]).ok();
    serde_json::json!({"success": true})
}
