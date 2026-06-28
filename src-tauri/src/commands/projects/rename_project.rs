use crate::helpers::{load_manifest, save_manifest};
use serde_json::Value;

#[tauri::command]
pub fn rename_project(project_id: String, name: String) -> Value {
    let mut manifest = load_manifest();
    if let Some(p) = manifest.projects.iter_mut().find(|p| p.id == project_id) { p.name = name; }
    save_manifest(&manifest);
    serde_json::json!({"success": true, "manifest": manifest})
}
