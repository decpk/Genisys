use crate::helpers::{get_data_dir, load_manifest, save_manifest};
use serde_json::Value;
use std::fs;

#[tauri::command]
pub fn delete_project(project_id: String) -> Value {
    let mut manifest = load_manifest();
    manifest.projects.retain(|p| p.id != project_id);
    if manifest.active_project_id.as_deref() == Some(&project_id) {
        manifest.active_project_id = manifest.projects.first().map(|p| p.id.clone());
    }
    save_manifest(&manifest);
    let dir = get_data_dir().join("projects").join(&project_id);
    if dir.exists() { fs::remove_dir_all(&dir).ok(); }
    serde_json::json!({"success": true, "manifest": manifest})
}
