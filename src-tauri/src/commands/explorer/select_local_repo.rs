use serde_json::Value;

#[tauri::command]
pub async fn cmd_select_local_repo() -> Value {
    serde_json::json!({"success": false, "error": "Use dialog plugin on frontend"})
}
