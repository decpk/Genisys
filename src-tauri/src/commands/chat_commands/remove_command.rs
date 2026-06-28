use crate::commands::AppState;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_remove_command(state: State<'_, AppState>, command_id: String) -> Value {
    state.db.conn().execute(
        "DELETE FROM commands WHERE id=?1 AND is_built_in=0",
        rusqlite::params![command_id],
    ).ok();
    serde_json::json!({"success": true})
}
