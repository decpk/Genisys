use crate::commands::AppState;
use crate::database::rename_webpage_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub async fn cmd_rename_webpage(
    state: State<'_, AppState>,
    id: String,
    name: String,
    updated_at: String,
) -> Result<Value, String> {
    rename_webpage_db(&state.db, &id, &name, &updated_at);

    Ok(serde_json::json!({
        "success": true,
        "updatedAt": updated_at
    }))
}
