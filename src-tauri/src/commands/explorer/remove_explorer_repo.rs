use crate::commands::AppState;
use crate::database::remove_explorer_repo_db;
use crate::types::ExplorerRepoEntry;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_remove_explorer_repo(state: State<'_, AppState>, entry: ExplorerRepoEntry) -> Value {
    remove_explorer_repo_db(&state.db, &entry); serde_json::json!({"success": true})
}
