use crate::commands::AppState;
use crate::database::save_webpage_db;
use crate::types::SavedWebpage;
use serde_json::Value;
use tauri::{AppHandle, Manager, State};
use uuid::Uuid;

/// Extract a title from raw HTML by looking for the `<title>...</title>` tag.
fn extract_html_title(html: &str) -> Option<String> {
    let lower = html.to_lowercase();
    let start = lower.find("<title>")? + "<title>".len();
    let end = lower[start..].find("</title>")? + start;
    let title = html[start..end].trim();
    if title.is_empty() {
        None
    } else {
        Some(title.to_string())
    }
}

#[tauri::command]
pub async fn cmd_save_webpage_from_html(
    app: AppHandle,
    state: State<'_, AppState>,
    html: String,
    name: String,
    source_url: String,
    created_at: String,
) -> Result<Value, String> {
    let id = Uuid::new_v4().to_string();
    let file_name = format!("{id}.html");

    // Resolve saved-webpages directory inside app data dir
    let webpages_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Cannot resolve app data dir: {e}"))?
        .join("saved-webpages");

    std::fs::create_dir_all(&webpages_dir)
        .map_err(|e| format!("Cannot create saved-webpages dir: {e}"))?;

    let file_path = webpages_dir.join(&file_name);

    // Write the raw HTML to disk
    std::fs::write(&file_path, html.as_bytes())
        .map_err(|e| format!("Failed to write HTML file: {e}"))?;

    let file_size = html.as_bytes().len() as i64;

    let final_name = if !name.is_empty() {
        name
    } else if let Some(title) = extract_html_title(&html) {
        title
    } else if !source_url.is_empty() {
        source_url.clone()
    } else {
        "Untitled Page".to_string()
    };

    let webpage = SavedWebpage {
        id: id.clone(),
        name: final_name,
        url: source_url,
        file_path: file_name,
        file_size,
        created_at: created_at.clone(),
        updated_at: created_at,
    };

    save_webpage_db(&state.db, &webpage);

    Ok(serde_json::json!({
        "success": true,
        "webpage": webpage
    }))
}
