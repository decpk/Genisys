use crate::helpers::load_manifest;
use crate::types::ProjectsManifest;

#[tauri::command]
pub fn load_projects() -> ProjectsManifest {
    let result = load_manifest();
    println!("[db-debug] load_projects => {} projects, active={:?}", result.projects.len(), result.active_project_id);
    result
}
