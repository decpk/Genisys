use crate::commands::AppState;
use crate::database::search_note_titles_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_search_note_suggestions(
    state: State<'_, AppState>,
    app_id: String,
    query: String,
) -> Value {
    let results = search_note_titles_db(&state.db, &app_id, &query);
    let items: Vec<Value> = results
        .into_iter()
        .map(|(id, title)| serde_json::json!({"id": id, "title": title}))
        .collect();
    serde_json::json!(items)
}
