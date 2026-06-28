use crate::helpers::load_settings as load_settings_helper;
use crate::types::ProjectSettings;

#[tauri::command]
pub fn cmd_load_settings(project_id: String) -> ProjectSettings { load_settings_helper(&project_id) }
