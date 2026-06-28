use crate::commands::AppState;
use crate::database::load_note_topics_db;
use crate::types::NoteTopic;
use tauri::State;

#[tauri::command]
pub fn cmd_load_note_topics(state: State<'_, AppState>, section_id: Option<String>) -> Vec<NoteTopic> {
    load_note_topics_db(&state.db, section_id.as_deref())
}
