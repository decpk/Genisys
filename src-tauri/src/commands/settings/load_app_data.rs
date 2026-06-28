use crate::commands::AppState;
use crate::database::load_app_data_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_load_app_data(state: State<'_, AppState>) -> Option<Value> {
    let result = load_app_data_db(&state.db);
    println!("[db-debug] cmd_load_app_data => {:?}", result.is_some());
    result
}
