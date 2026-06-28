use crate::commands::AppState;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_toggle_note_pin(state: State<'_, AppState>, note_id: String) -> Value {
    state
        .db
        .conn()
        .execute(
            "UPDATE notes SET is_pinned = CASE WHEN is_pinned = 0 THEN 1 ELSE 0 END, updated_at = ?2 WHERE id = ?1",
            rusqlite::params![note_id, chrono::Utc::now().to_rfc3339()],
        )
        .ok();
    serde_json::json!({"success": true})
}
