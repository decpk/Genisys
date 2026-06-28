use crate::commands::AppState;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_increment_prompt_usage(state: State<'_, AppState>, prompt_id: String) -> Value {
    let now = chrono::Utc::now().to_rfc3339();
    state.db.conn().execute(
        "UPDATE prompts SET usage_count = usage_count + 1, last_used_at = ?2, updated_at = ?2 WHERE id = ?1",
        rusqlite::params![prompt_id, now],
    ).ok();
    serde_json::json!({"success": true})
}
