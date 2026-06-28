use crate::commands::AppState;
use crate::types::ProjectsManifest;
use serde_json::Value;
use std::fs;
use tauri::State;

#[tauri::command]
pub fn cmd_delete_all_data(state: State<'_, AppState>) -> Value {
    // Clear all SQLite tables
    let conn = state.db.conn();
    let tables = [
        "global_pr_history", "reviewer_history", "apex_history",
        "explorer_history", "conversations", "chat_messages",
        "dashboard_projects", "prompts", "snippets",
    ];
    for table in tables {
        if let Err(e) = conn.execute(&format!("DELETE FROM {table}"), []) {
            eprintln!("[db] delete_all_data {table}: {e}");
        }
    }
    drop(conn);

    // Remove app-data.json
    let app_data_path = crate::helpers::get_data_dir().join("app-data.json");
    if app_data_path.exists() { fs::remove_file(&app_data_path).ok(); }

    // Remove project directories
    let projects_dir = crate::helpers::get_data_dir().join("projects");
    if projects_dir.exists() { fs::remove_dir_all(&projects_dir).ok(); }

    // Reset projects manifest
    crate::helpers::save_manifest(&ProjectsManifest { active_project_id: None, projects: vec![] });

    serde_json::json!({"success": true})
}
