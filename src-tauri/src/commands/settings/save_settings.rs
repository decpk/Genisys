use crate::helpers::save_settings as save_settings_helper;
use crate::types::ProjectSettings;
use serde_json::Value;

#[tauri::command]
pub fn cmd_save_settings(project_id: String, settings: ProjectSettings) -> Value {
    save_settings_helper(&project_id, &settings);
    serde_json::json!({"success": true})
}
