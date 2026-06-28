use crate::commands::AppState;
use crate::database::load_notes_db;
use crate::types::Note;
use tauri::State;

#[tauri::command]
pub fn cmd_load_notes(
    state: State<'_, AppState>,
    app_id: String,
    scope_type: String,
    scope_id: String,
) -> Vec<Note> {
    let result = load_notes_db(&state.db, &app_id, &scope_type, &scope_id);
    println!(
        "[db-debug] cmd_load_notes({}, {}, {}) => {} notes",
        app_id,
        scope_type,
        scope_id,
        result.len()
    );
    result
}
