use serde_json::Value;
use std::fs;

#[tauri::command]
pub fn cmd_reset_all_settings() -> Value {
    // Remove app-data.json (contains all settings)
    let app_data_path = crate::helpers::get_data_dir().join("app-data.json");
    if app_data_path.exists() { fs::remove_file(&app_data_path).ok(); }

    serde_json::json!({"success": true})
}
