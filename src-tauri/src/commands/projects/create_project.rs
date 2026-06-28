use crate::helpers::{get_data_dir, load_manifest, save_manifest};
use crate::types::{ProjectSettings, Project};
use serde_json::Value;
use std::fs;

#[tauri::command]
pub fn create_project(name: String) -> Value {
    let mut manifest = load_manifest();
    let id = uuid::Uuid::new_v4().to_string();
    let project = Project { id: id.clone(), name, created_at: chrono::Utc::now().to_rfc3339() };
    let dir = get_data_dir().join("projects").join(&id);
    fs::create_dir_all(&dir).ok();
    fs::write(dir.join("settings.json"), serde_json::to_string_pretty(&ProjectSettings::default()).unwrap_or_default()).ok();
    fs::write(dir.join("history.json"), "[]").ok();
    manifest.projects.push(project.clone());
    manifest.active_project_id = Some(id);
    save_manifest(&manifest);
    serde_json::json!({"success": true, "project": project, "manifest": manifest})
}
