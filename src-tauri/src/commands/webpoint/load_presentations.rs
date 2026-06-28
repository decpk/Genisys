use crate::commands::AppState;
use crate::database::load_presentations_db;
use crate::types::PresentationMeta;
use tauri::State;

#[tauri::command]
pub fn cmd_load_presentations(state: State<'_, AppState>) -> Vec<PresentationMeta> {
    load_presentations_db(&state.db)
}
