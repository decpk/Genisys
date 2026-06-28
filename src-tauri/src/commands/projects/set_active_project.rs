use crate::helpers::{load_manifest, save_manifest};
use serde_json::Value;

#[tauri::command]
pub fn set_active_project(project_id: String) -> Value {
    let mut manifest = load_manifest();
    manifest.active_project_id = Some(project_id);
    save_manifest(&manifest);
    serde_json::json!({"success": true})
}
