use crate::commands::AppState;
use crate::database::*;
use crate::types::*;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_dp_save_task(state: State<'_, AppState>, task: DPTask) -> Value {
    save_dp_task_db(&state.db, &task);
    serde_json::json!({"success": true})
}

#[tauri::command]
pub fn cmd_dp_load_tasks(
    state: State<'_, AppState>,
    start_date: String,
    end_date: String,
) -> Vec<DPTask> {
    load_dp_tasks_db(&state.db, &start_date, &end_date)
}

#[tauri::command]
pub fn cmd_dp_remove_task(state: State<'_, AppState>, id: String) -> Value {
    remove_dp_task_db(&state.db, &id);
    serde_json::json!({"success": true})
}

#[tauri::command]
pub fn cmd_dp_reorder_tasks(state: State<'_, AppState>, ordered_ids: Vec<String>) -> Value {
    reorder_dp_tasks_db(&state.db, &ordered_ids);
    serde_json::json!({"success": true})
}

#[tauri::command]
pub fn cmd_dp_bulk_update_status(
    state: State<'_, AppState>,
    ids: Vec<String>,
    status: String,
    completed_at: Option<String>,
) -> Value {
    bulk_update_dp_task_status_db(&state.db, &ids, &status, completed_at.as_deref());
    serde_json::json!({"success": true})
}
