use crate::commands::AppState;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_toggle_snippet_favorite(state: State<'_, AppState>, snippet_id: String) -> Value {
    state.db.conn().execute(
        "UPDATE snippets SET is_favorite = CASE WHEN is_favorite = 0 THEN 1 ELSE 0 END, updated_at = ?2 WHERE id = ?1",
        rusqlite::params![snippet_id, chrono::Utc::now().to_rfc3339()],
    ).ok();
    serde_json::json!({"success": true})
}
