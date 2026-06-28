use crate::commands::AppState;
use crate::database::{fuzzy_search_clipboard_items_db, load_clipboard_items_db};
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_load_clipboard_items(
    state: State<'_, AppState>,
    cursor: Option<String>,
    limit: Option<i64>,
    content_type: Option<String>,
    search: Option<String>,
    fuzzy: Option<bool>,
    offset: Option<i64>,
) -> Value {
    let limit = limit.unwrap_or(50);
    let is_fuzzy = fuzzy.unwrap_or(false);
    let search_str = search.as_deref().unwrap_or("").trim();

    if is_fuzzy && !search_str.is_empty() {
        let offset = offset.unwrap_or(0);
        let (items, has_more) = fuzzy_search_clipboard_items_db(
            &state.db,
            search_str,
            limit,
            offset,
            content_type.as_deref(),
        );
        return serde_json::json!({ "items": items, "hasMore": has_more });
    }

    let (items, has_more) = load_clipboard_items_db(
        &state.db,
        cursor.as_deref(),
        limit,
        content_type.as_deref(),
        search.as_deref(),
    );
    serde_json::json!({ "items": items, "hasMore": has_more })
}
