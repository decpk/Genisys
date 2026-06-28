use crate::commands::AppState;
use crate::database::load_webpages_db;
use crate::types::SavedWebpage;
use tauri::State;

#[tauri::command]
pub fn cmd_load_webpages(state: State<'_, AppState>) -> Vec<SavedWebpage> {
    load_webpages_db(&state.db)
}
